/**
 * Inspection Alert Database Queries
 * Server-side helpers for managing inspection due alerts
 */

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getNextInspectionDueDate, getDaysUntilDue } from "@/lib/stateInspectionRequirements";

export interface InspectionDueAlert {
  id: string;
  restaurantId: string;
  state: string;
  lastInspectionDate: string | null;
  calculatedDueDate: string;
  daysUntilDue: number | null;
  alertStatus: string;
  alert30DaysSentAt: string | null;
  alert7DaysSentAt: string | null;
  alertOverdueSentAt: string | null;
  ownerEmail: string | null;
  ownerPhone: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Calculate next inspection due date and save to database
 * Called after every successful state inspection sync
 */
export async function calculateAndSaveDueDate(
  restaurantId: string,
  state: string,
  lastInspectionDate: Date
): Promise<boolean> {
  try {
    const dueDate = getNextInspectionDueDate(lastInspectionDate, state);
    const daysUntil = getDaysUntilDue(dueDate);

    // Get restaurant owner contact info
    const { data: restaurant } = await supabaseAdmin
      .from("Restaurant")
      .select("id, ownerId")
      .eq("id", restaurantId)
      .single();

    if (!restaurant) {
      console.warn(
        `[calculateAndSaveDueDate] Restaurant not found: ${restaurantId}`
      );
      return false;
    }

    // Get owner contact info
    const { data: owner } = await supabaseAdmin
      .from("User")
      .select("email, phone")
      .eq("id", restaurant.ownerId)
      .single();

    // Upsert inspection due alert
    const { error: alertError } = await supabaseAdmin
      .from("InspectionDueAlert")
      .upsert(
        {
          restaurantId,
          state,
          lastInspectionDate: lastInspectionDate.toISOString(),
          calculatedDueDate: dueDate.toISOString(),
          daysUntilDue: daysUntil,
          alertStatus: "PENDING",
          ownerEmail: owner?.email || null,
          ownerPhone: owner?.phone || null,
        },
        {
          onConflict: "restaurantId",
        }
      );

    if (alertError) {
      console.error(
        `[calculateAndSaveDueDate] Failed to save alert for ${restaurantId}:`,
        alertError
      );
      return false;
    }

    // Update Restaurant table with quick lookups
    const { error: updateError } = await supabaseAdmin
      .rpc("update_restaurant_inspection_due_date", {
        p_restaurant_id: restaurantId,
        p_due_date: dueDate.toISOString(),
        p_days_until: daysUntil,
      });

    if (updateError) {
      console.error(
        `[calculateAndSaveDueDate] Failed to update restaurant ${restaurantId}:`,
        updateError
      );
      // Don't fail if restaurant update fails, alert record is more important
    }

    console.log(
      `[calculateAndSaveDueDate] Saved due date for ${restaurantId}: ${dueDate.toLocaleDateString()} (${daysUntil} days)`
    );
    return true;
  } catch (error: any) {
    console.error(`[calculateAndSaveDueDate] Error for ${restaurantId}:`, error);
    return false;
  }
}

/**
 * Get inspection due alert for a single restaurant
 * Used on merchant dashboard to display countdown
 */
export async function getRestaurantInspectionDueAlert(
  restaurantId: string
): Promise<InspectionDueAlert | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("InspectionDueAlert")
      .select("*")
      .eq("restaurantId", restaurantId)
      .single();

    if (error) {
      console.warn(
        `[getRestaurantInspectionDueAlert] Alert not found for ${restaurantId}`
      );
      return null;
    }

    return data as InspectionDueAlert;
  } catch (error: any) {
    console.error(
      `[getRestaurantInspectionDueAlert] Error fetching alert:`,
      error
    );
    return null;
  }
}

/**
 * Get all restaurants with approaching inspection due dates
 * Used by cron job to determine which alerts to send
 */
export async function getRestaurantsApproachingDueDate(
  daysThreshold: number
): Promise<
  Array<{
    alert: InspectionDueAlert;
    restaurant: {
      id: string;
      name: string;
      ownerId: string;
    };
  }>
> {
  try {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    const { data, error } = await supabaseAdmin
      .from("InspectionDueAlert")
      .select(
        `
        *,
        restaurant:restaurantId (
          id, name, ownerId
        )
      `
      )
      .lte("calculatedDueDate", thresholdDate.toISOString())
      .neq("alertStatus", "COMPLETED")
      .order("calculatedDueDate", { ascending: true });

    if (error) {
      console.error(
        `[getRestaurantsApproachingDueDate] Query error:`,
        error
      );
      return [];
    }

    return (data || []).map((item: any) => ({
      alert: item,
      restaurant: item.restaurant,
    }));
  } catch (error: any) {
    console.error(
      `[getRestaurantsApproachingDueDate] Error:`,
      error
    );
    return [];
  }
}

/**
 * Update alert status after sending notification
 */
export async function updateAlertStatus(
  alertId: string,
  alertType: "30_days" | "7_days" | "overdue"
): Promise<boolean> {
  try {
    const updatePayload: any = {
      updatedAt: new Date().toISOString(),
    };

    if (alertType === "30_days") {
      updatePayload.alert30DaysSentAt = new Date().toISOString();
    } else if (alertType === "7_days") {
      updatePayload.alert7DaysSentAt = new Date().toISOString();
    } else if (alertType === "overdue") {
      updatePayload.alertOverdueSentAt = new Date().toISOString();
    }

    const { error } = await supabaseAdmin
      .from("InspectionDueAlert")
      .update(updatePayload)
      .eq("id", alertId);

    if (error) {
      console.error(
        `[updateAlertStatus] Failed to update alert ${alertId}:`,
        error
      );
      return false;
    }

    return true;
  } catch (error: any) {
    console.error(`[updateAlertStatus] Error:`, error);
    return false;
  }
}

/**
 * Log alert sending history for debugging and auditing
 */
export async function logAlertHistory(
  restaurantId: string,
  state: string,
  alertType: string,
  daysUntilDue: number,
  emailSent: boolean,
  smsSent: boolean,
  emailAddress: string | null,
  phoneNumber: string | null,
  emailError?: string | null,
  smsError?: string | null
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("InspectionAlertHistory")
      .insert({
        restaurantId,
        state,
        alertType,
        daysUntilDue,
        emailSent,
        smsSent,
        emailAddress,
        phoneNumber,
        emailError: emailError || null,
        smsError: smsError || null,
      });

    if (error) {
      console.error(`[logAlertHistory] Failed to log history:`, error);
      return false;
    }

    return true;
  } catch (error: any) {
    console.error(`[logAlertHistory] Error:`, error);
    return false;
  }
}

/**
 * Mark inspection as completed (admin function)
 * Called when inspection is confirmed to have occurred
 */
export async function markInspectionCompleted(
  restaurantId: string
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("InspectionDueAlert")
      .update({
        alertStatus: "COMPLETED",
        updatedAt: new Date().toISOString(),
      })
      .eq("restaurantId", restaurantId);

    if (error) {
      console.error(
        `[markInspectionCompleted] Failed for ${restaurantId}:`,
        error
      );
      return false;
    }

    return true;
  } catch (error: any) {
    console.error(`[markInspectionCompleted] Error:`, error);
    return false;
  }
}

/**
 * Get inspection due alert metadata for merchant dashboard
 * Returns null if no alert found (restaurant not yet synced)
 */
export async function getInspectionAlertMetadata(restaurantId: string): Promise<{
  nextInspectionDueDate: string | null;
  daysUntilDue: number | null;
  alertStatus: string | null;
  isOverdue: boolean;
  requiresAttention: boolean;
} | null> {
  try {
    const alert = await getRestaurantInspectionDueAlert(restaurantId);

    if (!alert) {
      return null;
    }

    const daysUntil = alert.daysUntilDue || 0;
    const isOverdue = daysUntil < 0;
    const requiresAttention = daysUntil <= 30;

    return {
      nextInspectionDueDate: alert.calculatedDueDate,
      daysUntilDue: daysUntil,
      alertStatus: alert.alertStatus,
      isOverdue,
      requiresAttention,
    };
  } catch (error: any) {
    console.error(`[getInspectionAlertMetadata] Error:`, error);
    return null;
  }
}
