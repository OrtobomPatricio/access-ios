// Supabase Edge Function: manage_devices
// Handles CRUD operations for devices table

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for Flutter app
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, PATCH, DELETE, OPTIONS",
};

// Create Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

/**
 * Check if the current user is an admin
 */
async function isAdmin(authHeader: string | null): Promise<boolean> {
  if (!authHeader) return false;

  try {
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) return false;

    // Check if user has admin role in user_roles table
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (roleError || !roleData) {
      // Alternative: Check if user email is in admin list or has admin metadata
      const isAdminUser = user.user_metadata?.role === "admin" || 
                          user.user_metadata?.is_admin === true;
      return isAdminUser;
    }

    return true;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

/**
 * Handle GET request - List all devices ordered by alias
 */
async function handleGet(): Promise<Response> {
  try {
    const { data: devices, error } = await supabaseAdmin
      .from("devices")
      .select("device_id, alias, enabled, created_at")
      .order("alias", { ascending: true });

    if (error) {
      console.error("Error fetching devices:", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch devices", details: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ devices }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error in GET:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

/**
 * Handle POST request - Create new device (admin only)
 */
async function handlePost(request: Request, authHeader: string | null): Promise<Response> {
  // Check if user is admin
  const adminStatus = await isAdmin(authHeader);
  if (!adminStatus) {
    return new Response(
      JSON.stringify({ error: "Unauthorized: Admin access required" }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await request.json();
    const { device_id, alias, pin_hash } = body;

    // Validate required fields
    if (!device_id || !alias || !pin_hash) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: device_id, alias, pin_hash" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert new device
    const { data, error } = await supabaseAdmin
      .from("devices")
      .insert({
        device_id,
        alias,
        pin_hash,
        enabled: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating device:", error);
      return new Response(
        JSON.stringify({ error: "Failed to create device", details: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ device: data, message: "Device created successfully" }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error in POST:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

/**
 * Handle PATCH request - Update device enabled status
 */
async function handlePatch(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { device_id, enabled } = body;

    // Validate required fields
    if (!device_id || typeof enabled !== "boolean") {
      return new Response(
        JSON.stringify({ error: "Missing required fields: device_id, enabled (boolean)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update device
    const { data, error } = await supabaseAdmin
      .from("devices")
      .update({ enabled })
      .eq("device_id", device_id)
      .select()
      .single();

    if (error) {
      console.error("Error updating device:", error);
      return new Response(
        JSON.stringify({ error: "Failed to update device", details: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!data) {
      return new Response(
        JSON.stringify({ error: "Device not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ device: data, message: "Device updated successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error in PATCH:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

/**
 * Handle DELETE request - Delete device
 */
async function handleDelete(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const device_id = url.searchParams.get("device_id");

    if (!device_id) {
      return new Response(
        JSON.stringify({ error: "Missing required parameter: device_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Delete device
    const { data, error } = await supabaseAdmin
      .from("devices")
      .delete()
      .eq("device_id", device_id)
      .select()
      .single();

    if (error) {
      console.error("Error deleting device:", error);
      return new Response(
        JSON.stringify({ error: "Failed to delete device", details: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!data) {
      return new Response(
        JSON.stringify({ error: "Device not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ device: data, message: "Device deleted successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error in DELETE:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

/**
 * Main request handler
 */
serve(async (request: Request) => {
  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const authHeader = request.headers.get("authorization");

  try {
    switch (request.method) {
      case "GET":
        return await handleGet();

      case "POST":
        return await handlePost(request, authHeader);

      case "PATCH":
        return await handlePatch(request);

      case "DELETE":
        return await handleDelete(request);

      default:
        return new Response(
          JSON.stringify({ error: "Method not allowed" }),
          { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Unhandled error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
