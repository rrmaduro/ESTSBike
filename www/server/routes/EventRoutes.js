"use strict";

// Import necessary utilities and configuration
import { number, sendResponse, sendError } from "../config/db.js";

// SQL Queries for CRUD operations on events
const selectAllEvents = `
  SELECT e.*, et.name as type_name 
  FROM events e 
  JOIN event_types et ON e.type_id = et.id
`;

const selectEventById = `
  SELECT e.*, et.name as type_name 
  FROM events e 
  JOIN event_types et ON e.type_id = et.id 
  WHERE e.id = ?
`;

const insertEvent = "INSERT INTO events (type_id, name, date) VALUES (?, ?, ?)";
const updateEvent = "UPDATE events SET type_id = ?, name = ?, date = ? WHERE id = ?";
const deleteEvent = "DELETE FROM events WHERE id = ?";
const checkEventRegistrations = "SELECT COUNT(*) as count FROM member_events WHERE event_id = ?";

/**
 * Retrieves all events from the database along with their type.
 * @param {Object} request - The HTTP request object.
 * @param {Object} response - The HTTP response object.
 */
export async function getAllEvents(request, response) {
    console.log("Handling GET request for all events");
    try {
        // Fetch events from the database
        const result = await sendResponse(response, selectAllEvents, [], (rows) => rows);

        // Check the result status and send the appropriate response
        if (result.status === 200) {
            response.status(result.status).json(result.data);
        } else {
            sendError(response, result.data.message, result.status);
        }
        console.log("Successfully retrieved all events.");
    } catch (error) {
        console.error("Error fetching all events:", error);
        sendError(response, "Error fetching events", 500);
    }
}

/**
 * Retrieves a specific event by its ID from the database.
 * @param {Object} request - The HTTP request object.
 * @param {Object} response - The HTTP response object.
 */
export async function getEventById(request, response) {
    let id = number(request.params.id); // Convert ID to number if needed
    console.log(`Handling GET request for event with ID: ${id}`);

    if (id) {
        try {
            // Fetch event by ID from the database
            const result = await sendResponse(response, selectEventById, [id], (rows) => {
                if (rows.length) {
                    console.log(`Event found: ${JSON.stringify(rows[0])}`);
                    return rows[0]; // Respond with the event data
                } else {
                    console.log(`Event with ID ${id} not found`);
                    return sendError(response, "Event not found", 404); // Error if event not found
                }
            });

            if (result.status === 200) {
                response.status(result.status).json(result.data); // Send JSON response
            } else {
                sendError(response, result.data.message, result.status);
            }
        } catch (error) {
            console.error(`Error fetching event with ID ${id}:`, error);
            sendError(response, "Error fetching event", 500); // Send error if something goes wrong
        }
    } else {
        console.error("Invalid event ID");
        sendError(response, "Invalid event ID", 400); // Error if the ID is invalid
    }
}

/**
 * Creates a new event in the database.
 * @param {Object} request - The HTTP request object containing event data.
 * @param {Object} response - The HTTP response object.
 */
export async function createEvent(request, response) {
    let { type_id, name, date } = request.body;

    // Log the received data to ensure it's being sent correctly
    console.log("Received data:", { type_id, name, date });

    // Make sure type_id is an integer
    type_id = parseInt(type_id, 10);
    
    // Log the parsed type_id and date
    console.log("Parsed data:", { type_id, name, date });

    // Check if the required fields are present
    if (!type_id || !name || !date) {
        console.error("Missing required fields: Type ID, name, and date are required");
        return sendError(response, "Type ID, name, and date are required", 400);
    }

    // Ensure the date is in the correct format
    const formattedDate = new Date(date);
    if (isNaN(formattedDate)) {
        console.error("Invalid date format");
        return sendError(response, "Invalid date format", 400);
    }

    try {
        // Insert new event into the database
        const result = await sendResponse(response, insertEvent, [type_id, name, formattedDate], (result) => {
            console.log(`Event created with ID: ${result.insertId}`);
            return { id: result.insertId, type_id, name, date: formattedDate };
        });

        // Check result status and respond accordingly
        if (result.status === 201) {
            response.status(result.status).json(result.data);
        } else {
            console.error("Error from database:", result.data.message);
            sendError(response, result.data.message || "Error creating event", result.status);
        }
    } catch (error) {
        console.error("Error creating event:", error);
        sendError(response, "Error creating event", 500);
    }
}

/**
 * Updates an event by its ID in the database.
 * @param {Object} request - The HTTP request object containing event update data.
 * @param {Object} response - The HTTP response object.
 */
export async function updateEventById(request, response) {
    const { type_id, name, date } = request.body;

    console.log(`Received data for update: type_id=${type_id}, name=${name}, date=${date}`);
    
    // Ensure type_id is a number and the date is valid
    if (!type_id || !name || !date) {
        console.error("Missing required fields: Type ID, name, and date are required");
        return sendError(response, "Type ID, name, and date are required", 400);
    }

    const eventId = parseInt(request.params.id, 10);  // Ensure the ID is an integer
    const trimmedName = name.trim();  // Trim any leading/trailing spaces from the name

    // Convert the date to a format that MySQL accepts (YYYY-MM-DD HH:MM:SS)
    const formattedDate = new Date(date);
    if (isNaN(formattedDate)) {
        console.error("Invalid date format");
        return sendError(response, "Invalid date format", 400);
    }

    const mysqlFormattedDate = formattedDate.toISOString().slice(0, 19).replace('T', ' '); // Convert to 'YYYY-MM-DD HH:MM:SS'

    console.log(`Event ID to update: ${eventId}`);
    console.log(`Trimmed name: "${trimmedName}"`);
    console.log(`Formatted Date for MySQL: "${mysqlFormattedDate}"`);

    // Proceed with the update logic
    try {
        console.log("Executing update query...");
        console.log("Update Query Parameters:", [type_id, trimmedName, mysqlFormattedDate, eventId]);

        // Perform the update in the database
        const result = await sendResponse(response, updateEvent, [type_id, trimmedName, mysqlFormattedDate, eventId], (result) => {
            console.log("Query Result:", result);

            if (result.affectedRows > 0) {
                console.log(`Event with ID ${eventId} updated successfully`);
                return { id: eventId, type_id, name: trimmedName, date: mysqlFormattedDate };
            } else {
                console.log(`Event with ID ${eventId} not found or no changes made`);
                return sendError(response, "Event not found or no change made", 404);
            }
        });

        // Check result status and respond accordingly
        if (result.status === 200) {
            console.log("Update successful, sending response.");
            response.status(result.status).json(result.data);
        } else {
            console.error("Error from database:", result.data.message);
            sendError(response, result.data.message, result.status);
        }
    } catch (error) {
        console.error(`Error updating event: ${error.message}`);
        sendError(response, "Error updating event", 500);
    }
}

/**
 * Deletes an event by its ID from the database.
 * @param {Object} request - The HTTP request object containing event ID.
 * @param {Object} response - The HTTP response object.
 */
export async function deleteEventById(request, response) {
    let id = number(request.params.id);
    console.log(`Handling DELETE request for event with ID: ${id}`);

    if (!id) {
        console.error("Event ID is required to delete an event");
        return sendError(response, "You must indicate the event ID", 400);
    }

    try {
        // Check if there are any member registrations for this event
        const registrationsResult = await sendResponse(response, checkEventRegistrations, [id], (rows) => rows);
        const registrations = registrationsResult.data[0];
        console.log(`Registrations count for event ${id}: ${registrations.count}`);

        // Prevent deletion if there are any member registrations
        if (registrations.count > 0) {
            console.error("Cannot delete event that has registered members");
            return sendError(response, "Cannot delete event that has registered members", 400);
        }

        // Proceed with deleting the event
        const deleteResult = await sendResponse(response, deleteEvent, [id], (result) => {
            if (result.affectedRows) {
                console.log(`Event with ID ${id} deleted successfully`);
                return { count: result.affectedRows };
            } else {
                console.log(`Event with ID ${id} not found`);
                return sendError(response, "Event not found", 404);
            }
        });
        
        // Send the response with the deletion result
        if (deleteResult.status === 200) {
            response.status(deleteResult.status).json(deleteResult.data);
        } else {
            sendError(response, deleteResult.data.message, deleteResult.status);
        }
    } catch (error) {
        console.error(`Error deleting event with ID ${id}:`, error);
        sendError(response, "Error deleting event", 500);
    }
}
