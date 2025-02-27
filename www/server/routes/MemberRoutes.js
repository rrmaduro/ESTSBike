"use strict";
import { number, sendResponse, sendError } from "../config/db.js";

// SQL Queries for Member operations
const getAllMembers = "SELECT * FROM members";
const getMemberById = "SELECT * FROM members WHERE id = ?";
const getPreferredEventTypes = `
    SELECT et.* FROM event_types et
    JOIN member_preferred_event_types mpet ON et.id = mpet.event_type_id
    WHERE mpet.member_id = ?
`;
const getRegisteredEvents = `
    SELECT e.* FROM events e
    JOIN member_events me ON e.id = me.event_id
    WHERE me.member_id = ?
`;
const insertMember = "INSERT INTO members (name) VALUES (?)";
const updateMember = "UPDATE members SET name = ? WHERE id = ?";
const deleteMember = "DELETE FROM members WHERE id = ?";
const deleteMemberEvents = "DELETE FROM member_events WHERE member_id = ?";
const deletePreferredEventTypes = "DELETE FROM member_preferred_event_types WHERE member_id = ?";
const insertPreferredEventTypes = "INSERT INTO member_preferred_event_types (member_id, event_type_id) VALUES ?";

/**
 * Fetch all members from the database.
 * 
 * This function handles the GET request to retrieve all members from the database.
 * It fetches the list of all members and returns them as a JSON response.
 * If no members are found, an empty array is returned.
 * In case of any error, an appropriate error message is returned.
 * 
 * @param {Object} request - The request object (not used in this function).
 * @param {Object} response - The response object to return the result or error.
 */
export async function getMembers(request, response) {
    console.log("Fetching all members...");
    
    try {
        const members = await sendResponse(response, getAllMembers, [], (rows) => {
            console.log("Members fetched from DB:", rows);  
            return rows;
        });

        if (!members || members.length === 0) {
            console.warn("No members found in the database.");
            return response.json([]);  
        }

        console.log("Returning members:", members);
        response.json(members);
    } catch (error) {
        console.error("Error fetching members:", error);
        sendError(response, "Error fetching members", 500);
    }
}

/**
 * Fetch a specific member by their ID.
 * 
 * This function handles the GET request to retrieve a member by their unique ID.
 * If the member with the given ID is found, the member details are returned.
 * If the member is not found, an error message is returned.
 * 
 * @param {Object} request - The request object containing the `id` of the member.
 * @param {Object} response - The response object to return the result or error.
 */
export async function getMember(request, response) {
    let memberId = number(request.params.id);
    if (!memberId) {
        return sendError(response, "Invalid member ID", 400);
    }

    const members = await sendResponse(response, getMemberById, [memberId], (rows) => rows);

    if (!members || members.length === 0) {
        return sendError(response, "Member not found", 404);
    }

    response.json(members[0]);
}

/**
 * Create a new member.
 * 
 * This function handles the POST request to create a new member in the database.
 * It accepts the `name` and optional `preferredEventTypes` in the request body.
 * If the `name` is provided, the member is created. If any preferred event types are specified,
 * they are associated with the member.
 * If the member is created successfully, a success message is returned with the member details.
 * If any error occurs, an error message is returned.
 * 
 * @param {Object} request - The request object containing the `name` and `preferredEventTypes` of the new member.
 * @param {Object} response - The response object to return the result or error.
 */
export async function createMember(request, response) {
    const { name, preferredEventTypes } = request.body;

    if (!name) {
        return sendError(response, "Name is required", 400);
    }

    try {
        const result = await sendResponse(response, insertMember, [name], (res) => res);

        if (result.status !== 200) {
            return sendError(response, result.data.message || "Failed to create member", result.status);
        }

        const memberId = result.data.insertId; 

        if (preferredEventTypes && preferredEventTypes.length > 0) {
            const values = preferredEventTypes.map(typeId => [memberId, typeId]);
            const insertEventTypesResult = await sendResponse(response, insertPreferredEventTypes, [values], (res) => res);

            if (insertEventTypesResult.status !== 200) {
                return sendError(response, insertEventTypesResult.data.message || "Failed to insert preferred event types", insertEventTypesResult.status);
            }
        }

        response.status(200).json({
            message: "Member created successfully",
            member: { id: memberId, name, preferredEventTypes: preferredEventTypes || [] }
        });
    } catch (error) {
        console.error("Error creating member:", error);
        return sendError(response, "Error creating member", 500);
    }
}

/**
 * Update a member's information.
 * 
 * This function handles the PUT request to update a member's information, including their `name`
 * and `preferredEventTypes`. It first updates the member's name and then manages their event type preferences.
 * If successful, it returns the updated member details. If any validation fails, an error message is returned.
 * 
 * @param {Object} request - The request object containing the `id`, `name`, and `preferredEventTypes` of the member.
 * @param {Object} response - The response object to return the result or error.
 */
export async function updateMemberInfo(request, response) {
    let memberId = number(request.params.id);
    const { name, preferredEventTypes } = request.body;
    if (!name) {
        return sendError(response, "Name is required", 400);
    }

    const result = await sendResponse(response, updateMember, [name, memberId], (res) => res);

    if (!result || !result.status) {
        return sendError(response, "Unexpected error occurred", 500);
    }

    if (result.status === 404) {
        return sendError(response, "Member not found", 404);
    }

    // Remove old preferences and insert new ones
    await sendResponse(response, deletePreferredEventTypes, [memberId], () => ({}));

    if (preferredEventTypes && preferredEventTypes.length > 0) {
        const values = preferredEventTypes.map(typeId => [memberId, typeId]);
        await sendResponse(response, insertPreferredEventTypes, [values], () => ({}));
    }

    response.status(result.status).json({ id: memberId, name, preferredEventTypes: preferredEventTypes || [] });
}

/**
 * Delete a member by their ID.
 * 
 * This function handles the DELETE request to remove a member from the database.
 * It first checks if the member exists, then deletes their event registrations and preferences.
 * Finally, it deletes the member record from the database.
 * If successful, a 204 (No Content) response is returned. If the member is not found or any error occurs,
 * an error message is returned.
 * 
 * @param {Object} request - The request object containing the `id` of the member to delete.
 * @param {Object} response - The response object to return the result or error.
 */
export async function deleteMemberById(request, response) {
    let memberId = Number(request.params.id);
    console.log("Attempting to delete member with ID:", memberId);  

    if (isNaN(memberId)) {
        console.error("Invalid member ID:", request.params.id);
        return sendError(response, "Invalid member ID", 400);
    }

    try {
        const existingMember = await sendResponse(response, getMemberById, [memberId], (rows) => rows);
        if (!existingMember || existingMember.length === 0) {
            console.error("Member not found before deletion:", memberId);
            return sendError(response, "Member not found", 404);
        }

        console.log("Deleting events and preferences for member ID:", memberId);

        // Delete the member's events and preferences
        await sendResponse(response, deleteMemberEvents, [memberId], () => ({}));
        await sendResponse(response, deletePreferredEventTypes, [memberId], () => ({}));

        const result = await sendResponse(response, deleteMember, [memberId], (res) => res);
        console.log("Delete query result:", result);

        if (!result || !result.affectedRows) {
            console.error("Delete failed, no affected rows:", memberId);
            return sendError(response, "Member not found", 404);
        }

        console.log("Member deleted successfully");
        return response.status(204).send();
    } catch (error) {
        console.error("Error deleting member:", error);
        return sendError(response, "Error deleting member", 500);
    }
}
