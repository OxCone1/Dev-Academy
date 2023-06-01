# Helsinki City Bike App

🚲 Welcome to the Helsinki City Bike App! 🌇

This is the pre-assignment for Solita Dev Academy Finland 2023. The app displays data from journeys made with city bikes in the Helsinki Capital area. You can explore the journeys, stations, and various statistics related to the bike usage.

# Installation
## Prerequisites

- Lastest [Node.js](https://nodejs.org/en) installed (check and compare with "node --version" in cmd)
- Version of [Git](https://git-scm.com/download) is at least 2.38.0 (check and compare with "git --version" in cmd)
- [MongoDB server](https://www.mongodb.com/try/download/community) installed (install MongoDB Community Server Download)

## Installation Steps
⚙️ To run the app locally, follow these steps:

1. Clone the repository:

   ```shell
   git clone https://github.com/OxCone1/Dev-Academy.git
   ```
2. Navigate to the project directory:

   ```shell
   cd Dev-Academy
   ```
3. Install the dependencies (Windows):
   - Auto:

     ```shell
     cd ./install-dependencies.bat
     ```
     
   - Manual:
   
     ```shell
     cd server
     npm i
     ```
     ```shell
     cd ..
     cd frontend
     npm i
     ```
     ```shell
     cd ..
     cd testing
     npm i
     ```

4. Start the MongoDB server:

    ```shell
    mkdir "C:\data\db"
    "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --quiet
    ```

5. Start the backend server:

    ```shell
    cd..
    cd server
    node server.js
    ```

6. Start the frontend server:

    ```shell
    cd..
    cd frontend
    npm start
    ```


# Frontend

## 1. Map (Stations) ([Leaflet library](https://leafletjs.com/))

- The map displays the locations of the stations in the Helsinki Capital area. The stations are marked with a bike parking icon(Pic.1). When you click on a station, the station's name, address and dynamically fetched statistics for the station are displayed. The statistics include average distance of journeys started from the station, average distance of journeys ended at the station, top 5 stations where started from this station journeys ended, and top 5 stations where ended at this station journeys started(Pic.2).

- On the side of station page there is a list of all the stations with enabled search bar(Pic.3), so you can search for a specific station, enabled pagination and page item limit. Also, when station is clicked in that list, it will located on the map and statistics will be displayed.

| Pic.1 | Pic.2 | Pic.3 |
| :---: | :---: | :---: |
| ![Pic.1](images/map.png) | ![Pic.2](images/statistics.png) | ![Pic.3](images/stsationList.png) |


### 2. Map (Journeys) ([Leaflet library](https://leafletjs.com/))

- The journeys page displays a list of all the journeys made with city bikes in the Helsinki Capital area. Journeys contain the start and end times, duration, distance, and the stations where the journey started and ended(Pic.1). The list is paginated and the page item limit can be adjusted. The journeys can be sorted by the start and end times of the journey, the duration of the journey, and the distance of the journey in ascending or descending order(Pic.2). 

- When you click on a journey, it is displayed on the map with a line between the start and end stations(Pic.3).

| Pic.1 | Pic.2 | Pic.3 |
| :---: | :---: | :---: |
| ![Pic.1](images/journeyList.png) | ![Pic.2](images/sort.png) | ![Pic.3](images/journeyLine.png) |

### 3. Adding Journeys/Stations

- This functionality is only available if user is logged in. But because there was no requirement to implement user registration, I have created a default user with username: "admin" and password: "admin". So, you can login with these credentials and add journeys and stations(Pic.1).

- The app allows you to add new journeys and stations to the database. The journeys and stations could be added by clicking on the "Add" button that will call a drop-down menu where you can choose to add a journey or a station(Pic.2). The journeys and stations are added to the database and displayed on the journeys and stations pages respectively.   

- When adding station or journey you will have to fill a form in shown modal(Pic.3). Input information carefully, as let's say, latitude and longitude are really sensitive to input. If you will input wrong latitude and longitude, station will still be added, but it might be located in the middle of nowhere.

| Pic.1 | Pic.2 | Pic.3 |
| :---: | :---: | :---: |
| ![Pic.1](images/login.png) | ![Pic.2](images/dropdown.png) | ![Pic.3](images/journeyInput.png) |

# Backend

## 1. API

Base URL
--------

The base URL for all API endpoints is: `http://localhost:3002` or remote server `https://academy-server-2023.herokuapp.com/`


Authentication
--------------

Some endpoints require authentication using a JSON Web Token (JWT) in the request headers. You need to include the JWT in the Authorization header with the value `Bearer <token>`, where `<token>` is the JWT obtained after successful login.

Stations
--------

### Retrieve Stations

Retrieves a list of stations.

URL: `/stations`

Method: `GET`

Parameters:

-   `page` (optional): The page number for pagination. Default is 1.
-   `limit` (optional): The maximum number of stations to retrieve per page. Default is 10.
-   `search` (optional): A search query to filter stations by name or address.

Response:

-   `totalStations`: The total number of stations.
-   `currentPage`: The current page number.
-   `totalPages`: The total number of pages.
-   `hasNextPage`: Indicates whether there is a next page.
-   `hasPreviousPage`: Indicates whether there is a previous page.
-   `stations`: An array of station objects.

### Get Station

Retrieves a specific station by its ID.

URL: `/getStation`

Method: `POST`

Request Body:

-   `ID`: The ID of the station to retrieve.

Response:

-   `station`: The station object.
-   `avgDistanceFrom`: The average distance from the station to other stations.
-   `avgDistanceTo`: The average distance to the station from other stations.
-   `topReturnStations`: The top return stations from the given station.
-   `topDepartureStations`: The top departure stations from the given station.

Journeys
--------

### Retrieve Journeys

Retrieves a list of journeys.

URL: `/journeys`

Method: `POST`

Request Body:

-   `options` (optional): An object containing options for filtering and sorting journeys.
    -   `page` (optional): The page number for pagination. Default is 1.
    -   `limit` (optional): The maximum number of journeys to retrieve per page. Default is 10.
    -   `filter` (optional): An object specifying filter conditions for journeys.
    -   `sort` (optional): An object specifying sorting criteria for journeys.
        -   `departure` (optional): Sorts journeys by departure date.
        -   `returnDate` (optional): Sorts journeys by return date.

Response:

-   `totalJourneys`: The total number of journeys.
-   `currentPage`: The current page number.
-   `totalPages`: The total number of pages.
-   `hasNextPage`: Indicates whether there is a next page.
-   `hasPreviousPage`: Indicates whether there is a previous page.
-   `journeys`: An array of journey objects.

### Create Journey

Creates a new journey.

URL: `/journey`

Method: `POST`

Request Headers:

-   `Authorization`: JWT token for authentication.

Request Body:

-   `journey`: An object containing journey details.
    -   `departure`: The departure date of the journey (string).
    -   `returnDate`: The return date of the journey (string).
    -   `departure_station_id`: The ID of the departure station (number).
    -   `return_station_name`: The name of the return station (string).
    -   `return_station_id`: The ID of the return station (number).
    -   `departure_station_name`: The name of the departure station (string).
    -   `coveredDistance`: The distance covered during the journey (number).
    -   `duration`: The duration of the journey (number).

Response:

-   `message`: A success message indicating the journey creation status.

User Authentication
--------

### Login

Authenticates a user and returns a JWT.

URL: `/user/login`

Method: `POST`

Request Body:

-   `username`: The username of the user.
-   `password`: The password of the user.

Response:

-   `token`: The JWT token.

### Verify Token

Verifies a JWT.

URL: `/user/verify`

Method: `POST`

Authentication: Required (JWT)

Response:

-   Success: 200 OK (User verified)
-   Error: 401 Unauthorized or 500 Internal Server Error


# License

Journey data owned by [City Bike Finland](https://www.citybikefinland.fi/).

Station data file is owned by [HSL](https://public-transport-hslhrt.opendata.arcgis.com/datasets/helsingin-ja-espoon-kaupunkipy%C3%B6r%C3%A4asemat-avoin/explore).