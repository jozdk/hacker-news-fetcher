# Hacker News Fetcher

A React application that fetches stories from the Hacker News API with a few little [features](#Features) that let you customize search criteria and facilitate browsing.

This project was built following the instructions of "The Road To Learn React" by Robin Wieruch, but has been modified and extended in parts.

## Features

- Search stories from Hacker News about topics you're interested in
    - Search by relevance
    - Search by date (latest stories first)
- Infinite pagination (click `More` to fetch next page)
- Remembers your last 5 searches
- Sort results by title, author, comments, points or date
- Dismiss stories from result list

## Technologies

This application runs on [React](https://reactjs.org/) (bootstrapped with [Create-React-App](https://create-react-app.dev/)) with [Styled Components](https://styled-components.com/). Requests to the Hacker News API are made with [Axios](https://axios-http.com/docs/intro). The current search term as well as the last five search requests are persisted to the Browser's local storage with a custom hook.

## Requirements

Node.js (tested with v16)

## Running the App

### Development

`npm start`

### Production

`npm run build`