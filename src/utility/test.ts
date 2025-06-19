import { InternalServerErrorException } from "@nestjs/common";
import * as dayjs from 'dayjs';


async function fetchAllFlight() {
  try {
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFua2l0Lm1pc2hyYUB0ZWNoZWFnbGUuaW4iLCJpYXQiOjE3NTAyMzgzMDksImV4cCI6MTc1MDI0OTEwOX0.URLmvtSiQQ1P9PcyQ1hGxxwgF6X1iz3uHUJomQ1WGhw";
    if (!token) {
      throw new InternalServerErrorException('CLEAR_SKY_API_KEY is not set in .env');
    }

    const body = {
      filterBy: "ALL",
      duration: {
        d: "custom",
        details: {
          from: "2024-01-01T00:00:00.000Z",
          to: dayjs().toISOString()
        }
      },
      sourceLocation: "ALL",
      page: 1,
      itemPerPage: 100000
    };

    const response = await fetch('https://test.clearsky.techeagle.org/flight/get_all_flights', {
      method: 'POST',
      headers: {
        authorization: `${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new InternalServerErrorException(`Failed to fetch drones: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Fetched Drones:', data);
    return data.data;
  } catch (err) {
    console.error('Error in fetchAllDrones:', err.message);
    throw new InternalServerErrorException(err.message || 'Unexpected error occurred while fetching drones.');
  }
}

fetchAllFlight();