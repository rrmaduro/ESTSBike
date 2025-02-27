"use strict";
import mysql from "mysql2/promise";
import connectionOptions from "./connection-options.js";

async function execute(command, parameters = []) {
    let connection;
    try {
        connection = await mysql.createConnection(connectionOptions);
        let [result] = await connection.execute(command, parameters);
        return result;
    } catch (error) {
        return void 0;
    } finally {
        connection?.end();
    }
}

function number(value) {
    let result = Number(value);
    return isNaN(result) ? void 0 : result;
}

function string(value) {
    return value === undefined ? void 0 : String(value);
}

function date(value) {
    let result = new Date(String(value));
    return isNaN(result.getTime()) ? void 0 : result.toISOString().slice(0, 10); 
}

function boolean(value, forceValue = false) {
    let result;
    if (typeof value === "boolean") {
        result = value;
    } else if (typeof value === "string") {
        value = value.toLowerCase();
        result = value === "true" || (value === "false" ? false : void 0);
    }
    return result === void 0 ? (forceValue ? false : void 0) : Number(result); 
}

function toBoolean(value) {
    return Boolean(value);
}

function sendError(response, error = "", status = 400) {
    response.status(status).end(typeof error === "string" ? error : "");
}

async function sendResponse(response, query, params, transform = (rows) => rows, status = 200) {
    try {
        const result = await execute(query, params);

        if (result && result.affectedRows !== undefined) {
            if (result.affectedRows === 0) {
                return { status: 404, data: { message: "No data found or affected" } };
            }

            return { status, data: { message: `${result.affectedRows} row(s) affected` } };
        }

        if (!result || !Array.isArray(result) || result.length === 0) {
            return { status: 404, data: { message: "No data found" } };
        }

        return { status, data: transform(result) };

    } catch (error) {
        console.error("Error executing query:", error);
        return { status: 500, data: { error: "Database query failed" } };
    }
}


export { execute, number, string, date, boolean, toBoolean, sendError, sendResponse };
