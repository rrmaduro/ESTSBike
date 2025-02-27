"use strict";
import { number, sendResponse, sendError } from "../config/db.js";

// SQL Queries for Member Event operations
const registerMemberEvent = "INSERT INTO member_events (member_id, event_id) VALUES (?, ?)";
const deleteMemberEvent = "DELETE FROM member_events WHERE member_id = ? AND event_id = ?";
const checkMemberExists = "SELECT * FROM members WHERE id = ?";
const checkEventExists = "SELECT * FROM events WHERE id = ?";
const checkMemberPreference = "SELECT COUNT(*) as count FROM member_preferred_event_types WHERE member_id = ? AND event_type_id = ?";

/**
 * Register a member to an event.
 * 
 * This function handles the POST request to register a member for a specific event.
 * It validates that both `memberId` and `eventId` are provided in the request parameters.
 * It checks if the member exists in the database and if the event exists.
 * It also checks if the member prefers the event's type before allowing the registration.
 * If successful, the member is registered for the event, and a success response is returned.
 * If any validation fails, an appropriate error message is returned.
 * 
 * @param {Object} request - The request object containing the `memberId` and `eventId`.
 * @param {Object} response - The response object to return the result or error.
 */
export async function registerMemberToEvent(request, response) {
    let memberId = number(request.params.memberId);
    let eventId = number(request.params.eventId);
    if (!memberId || !eventId) {
        return sendError(response, "Invalid member or event ID", 400);
    }

    // Check if the member exists in the database
    const [members] = await sendResponse(response, checkMemberExists, [memberId], (rows) => rows);
    if (!members.length) {
        return sendError(response, "Member not found", 404);
    }

    // Check if the event exists in the database
    const [events] = await sendResponse(response, checkEventExists, [eventId], (rows) => rows);
    if (!events.length) {
        return sendError(response, "Event not found", 404);
    }

    // Check if the member prefers the event's type
    const [preferences] = await sendResponse(response, checkMemberPreference, [memberId, events[0].type_id], (rows) => rows);
    if (preferences.count === 0) {
        return sendError(response, "Member does not prefer this event type", 400);
    }

    // Register the member to the event
    await sendResponse(response, registerMemberEvent, [memberId, eventId], () => ({ success: true }), 201);
}

/**
 * Unregister a member from an event.
 * 
 * This function handles the DELETE request to unregister a member from a specific event.
 * It validates that both `memberId` and `eventId` are provided in the request parameters.
 * The function then attempts to delete the registration for the given member and event.
 * If the registration is found and successfully deleted, a success response is returned.
 * If the registration is not found, an error response is returned.
 * 
 * @param {Object} request - The request object containing the `memberId` and `eventId`.
 * @param {Object} response - The response object to return the result or error.
 */
export async function unregisterMemberFromEvent(request, response) {
    let memberId = number(request.params.memberId);
    let eventId = number(request.params.eventId);
    if (!memberId || !eventId) {
        return sendError(response, "Invalid member or event ID", 400);
    }

    // Attempt to delete the member's registration for the event
    await sendResponse(response, deleteMemberEvent, [memberId, eventId], (result) => {
        return result.affectedRows ? { success: true } : sendError(response, "Registration not found", 404);
    });
}
