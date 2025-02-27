# ETSTBike - Cycling Club Management System - Phase 2

## Project Objective
The objective of this phase was to enhance the existing Cycling Club Management System by integrating a data persistence mechanism. This was achieved by developing a Single Page Application (SPA) that followed the Representational State Transfer (REST) methodology and communicated with a MySQL database using JSON serialization.

To minimize modifications to the initial project, the SPA was designed to interact seamlessly with the existing system while ensuring robust data management.

## System Development

### Database Design
A MySQL database was created to store all relevant data, including:
- **Event Types**
- **Events**
- **Club Members**

Special attention was given to choosing appropriate data types, defining primary and foreign keys, and implementing necessary constraints and indexes to maintain data integrity.

### REST API Implementation
A Node.js application was developed to handle API requests based on REST principles. Each entity in the system (event types, events, and members) had four corresponding CRUD (Create, Read, Update, Delete) operations.

More complex routes were required for relationships involving many-to-one and many-to-many associations. For instance:
- Events were linked to event types.
- Members were associated with both event types and specific events, forming sub-entities.

Routes were designed as follows:
- **Primary Entities:**
  - `/members/{id}`
  - `/events/{id}`
  - `/eventTypes/{id}`
- **Sub-Entities:**
  - `/members/{id}/events/{event_id}`
  - `/members/{id}/eventTypes/{event_type_id}`

Alternatively, if sub-entity routes were not implemented, the member entity routes were designed to return arrays containing the IDs of associated event types and events.

Data consistency was enforced by preventing actions such as assigning an event to a member if it did not match the member’s preferred event types.

### API Testing
API functionality was tested progressively as each set of routes was implemented. Various tools were used for testing, including:
- **Thunder Client** (Visual Studio Code extension)
- **Postman**
- **cURL**

### Frontend Integration
Once the server-side functionality was validated, modifications were made to the initial project’s frontend:
1. **Database-Driven IDs:** Object identifiers were retrieved from the database instead of being generated locally in JavaScript.
2. **Asynchronous Data Handling:**
   - Data was retrieved from the server using asynchronous requests via the Fetch API or AJAX.
   - Special care was taken to replace received database IDs with actual object references.
   - Requests were made whenever data was displayed to ensure the most up-to-date information.
3. **Server Communication for Data Modifications:**
   - Any action modifying local data (creating, updating, or deleting objects) was executed only if the server responded successfully.

The implementation followed a phased approach, starting with simple entities (event types) and progressing to more complex ones (events and members).

