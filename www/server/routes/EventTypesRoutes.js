"use strict";
import { number, sendResponse, sendError } from "../config/db.js";

// SQL Queries for CRUD operations
const selectAllEventTypes = "SELECT * FROM event_types";
const selectEventTypeById = "SELECT * FROM event_types WHERE id = ?";
const insertEventType = "INSERT INTO event_types (name) VALUES (?)";
const updateEventType = "UPDATE event_types SET name = ? WHERE id = ?";
const deleteEventType = "DELETE FROM event_types WHERE id = ?";
const checkEventsWithType = "SELECT COUNT(*) as count FROM events WHERE type_id = ?";
const checkMembersWithType = "SELECT COUNT(*) as count FROM member_preferred_event_types WHERE event_type_id = ?";

/**
 * Get all event types.
 * 
 * This function handles the GET request to fetch all event types from the database.
 * It uses the `selectAllEventTypes` SQL query to retrieve all event types.
 * If successful, the event types are returned in the response with a 200 status.
 * If an error occurs, an error response with an appropriate status and message is returned.
 * 
 * @param {Object} request - The request object.
 * @param {Object} response - The response object.
 */
export async function getAllEventTypes(request, response) {
    const result = await sendResponse(response, selectAllEventTypes, [], (rows) => rows);
    if (result.status === 200) {
        response.status(result.status).json(result.data);
    } else {
        sendError(response, result.data.message, result.status);
    }
}

/**
 * Get a specific event type by its ID.
 * 
 * This function handles the GET request to fetch a specific event type by its ID.
 * It uses the `selectEventTypeById` SQL query to retrieve the event type.
 * If the event type is found, it is returned in the response with a 200 status.
 * If the event type is not found or the ID is invalid, an error response is returned.
 * 
 * @param {Object} request - The request object.
 * @param {Object} response - The response object.
 */
export async function getEventTypeById(request, response) {
    let id = number(request.params.id);
    if (id) {
        const result = await sendResponse(response, selectEventTypeById, [id], (rows) => rows.length ? rows[0] : sendError(response, "Event type not found", 404));
        if (result.status === 200) {
            response.status(result.status).json(result.data);
        } else {
            sendError(response, result.data.message, result.status);
        }
    } else {
        sendError(response, "Invalid event type ID", 400);
    }
}

/**
 * Create a new event type.
 * 
 * This function handles the POST request to create a new event type.
 * It checks that the `name` field is provided in the request body.
 * If valid, the event type is inserted into the database using the `insertEventType` query.
 * A successful creation returns the newly created event type with a 201 status.
 * If an error occurs or the `name` is missing, an error response is returned.
 * 
 * @param {Object} request - The request object.
 * @param {Object} response - The response object.
 */
export async function createEventType(request, response) {
    const { name } = request.body || {};

    if (!name) {
        return sendError(response, "Name is required", 400);
    }

    const result = await sendResponse(response, insertEventType, [name], (result) => ({ id: result.insertId, name }), 201);
    if (result.status === 201) {
        response.status(result.status).json(result.data);
    } else {
        sendError(response, result.data.message, result.status);
    }
}

/**
 * Update an existing event type by its ID.
 * 
 * This function handles the PUT request to update an existing event type.
 * It checks that both the `id` and `name` are provided in the request.
 * The event type is updated using the `updateEventType` query.
 * A successful update returns the updated event type with a 200 status.
 * If the event type is not found, an error response is returned.
 * 
 * @param {Object} request - The request object.
 * @param {Object} response - The response object.
 */
export async function updateEventTypeById(request, response) {
    let id = number(request.params.id);
    const { name } = request.body;

    if (!id || !name) {
        return sendError(response, "Name is required", 400);
    }

    const result = await sendResponse(response, updateEventType, [name, id], (result) => {
        return result.affectedRows ? { id, name } : sendError(response, "Event type not found", 404);
    });

    if (result.status === 200) {
        response.status(result.status).json(result.data);
    } else {
        sendError(response, result.data.message, result.status);
    }
}

/**
 * Delete an event type by its ID.
 * 
 * This function handles the DELETE request to remove an event type by its ID.
 * Before deleting, it checks if the event type is used by any events or preferred by members.
 * If there are any dependencies (e.g., events or members), the deletion is prevented.
 * If the event type can be deleted, it is removed from the database.
 * A successful deletion returns a 200 status with the count of deleted rows.
 * If any dependencies exist or the event type is not found, an error response is returned.
 * 
 * @param {Object} request - The request object.
 * @param {Object} response - The response object.
 */
export async function deleteEventTypeById(request, response) {
    let id = number(request.params.id);
    if (!id) {
        return sendError(response, "You must indicate the event type ID", 400);
    }

    const result = await sendResponse(response, checkEventsWithType, [id], (rows) => rows);
    const events = result.data[0];

    if (events.count > 0) {
        return sendError(response, "Cannot delete event type that is being used by events", 400);
    }

    const resultMembers = await sendResponse(response, checkMembersWithType, [id], (rows) => rows);
    const members = resultMembers.data[0];

    if (members.count > 0) {
        return sendError(response, "Cannot delete event type that is preferred by members", 400);
    }

    const deleteResult = await sendResponse(response, deleteEventType, [id], (result) => {
        return result.affectedRows ? { count: result.affectedRows } : sendError(response, "Event type not found", 404);
    });

    if (deleteResult.status === 200) {
        response.status(deleteResult.status).json(deleteResult.data);
    } else {
        sendError(response, deleteResult.data.message, deleteResult.status);
    }
}
