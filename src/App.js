import React, { useState, useEffect, useReducer, useCallback } from "react";
import axios from "axios";
import { StyledContainer, StyledHeadlinePrimary } from "./StyledComponents";
import { SearchForm } from "./components/SearchForm.jsx";
import { List } from "./components/List.jsx";
import { LastSearches } from "./components/LastSearches.jsx";
import { ButtonMore } from "./components/ButtonMore.jsx";

const API_ENDPOINT = "https://hn.algolia.com/api/v1/search";

// Custom Hook
const useSemiPersistentState = (key, initialState) => {
  let storedValue = localStorage.getItem(key);
  try {
    storedValue = JSON.parse(storedValue)
  } catch (err) { }

  const [value, setValue] = useState(storedValue != null ? storedValue : initialState);

  useEffect(() => {
    const toStore = typeof value === "object" ? JSON.stringify(value) : value;
    localStorage.setItem(key, toStore);
  }, [value, key]);

  return [value, setValue];
}

// Reducer function
const storiesReducer = (state, action) => {
  switch (action.type) {
    case "STORIES_FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false
      };
    case "STORIES_FETCH_SUCCESS":
      return {
        ...state, // why?
        isLoading: false,
        isError: false,
        data: action.payload.page === 0
          ? action.payload.list
          : state.data.concat(action.payload.list),
        page: action.payload.page
      };
    case "STORIES_FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true
      };
    case "REMOVE_STORY":
      return {
        ...state,
        data: state.data.filter((story) => action.payload.objectID !== story.objectID)
      };
    case "UPDATE_PAGE":
      return {
        ...state,
        page: action.payload
      };
    default:
      throw new Error();
  }
}

const getURL = (searchTerm, searchLatest, page) => {
  if (!searchTerm) {
    return API_ENDPOINT + "?tags=front_page";
  }

  return `${API_ENDPOINT}${searchLatest}?query=${searchTerm}&page=${page}&tags=story`;
}

const updateSearchRequests = (searchRequests, searchTerm) => {
  const updatedRequests = searchRequests.concat(searchTerm);
  const noDuplicatesInARow = updatedRequests.reduce((result, searchRequest, index) => {
    if (index === 0) {
      return result.concat(searchRequest);
    }
    const previousSearchRequest = result[result.length - 1];
    if (searchRequest === previousSearchRequest) {
      return result;
    } else {
      return result.concat(searchRequest);
    }
  }, []);
  const noEmptySearchTerms = noDuplicatesInARow.filter((searchTerm, index) => index === noDuplicatesInARow.length - 1 || searchTerm !== "")
  if (noEmptySearchTerms.length > 6) {
    noEmptySearchTerms.shift();
  }
  return noEmptySearchTerms;
}

const App = () => {
  const [searchTerm, setSearchTerm] = useSemiPersistentState("search", "React");
  const [searchLatest, setSearchLatest] = useState("");
  const [stories, dispatchStories] = useReducer(storiesReducer, { data: [], page: 0, isLoading: false, isError: false });
  const [searchRequests, setSearchRequests] = useSemiPersistentState("last-searches", [searchTerm]);

  const handleFetchStories = useCallback(async () => {
    dispatchStories({ type: "STORIES_FETCH_INIT" });

    try {
      const currentSearchRequest = searchRequests[searchRequests.length - 1];
      const url = getURL(currentSearchRequest, searchLatest, stories.page);
      const result = await axios.get(url);
      dispatchStories({
        type: "STORIES_FETCH_SUCCESS",
        payload: {
          list: result.data.hits,
          page: result.data.page
        }
      });
    } catch {
      dispatchStories({ type: "STORIES_FETCH_FAILURE" });
    }

  }, [searchRequests, searchLatest, stories.page]);

  useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);

  const handleRemoveStory = (item) => {
    dispatchStories({
      type: "REMOVE_STORY",
      payload: item
    });
  }

  const handleSearchInput = (event) => {
    setSearchTerm(event.target.value);
  }

  const handleSearch = (searchTerm) => {
    const updatedSearchRequests = updateSearchRequests(searchRequests, searchTerm);
    setSearchRequests(updatedSearchRequests);
    dispatchStories({
      type: "UPDATE_PAGE",
      payload: 0
    })
  }

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    handleSearch(searchTerm);
  }

  const handleLastSearch = (searchTerm) => {
    setSearchTerm(searchTerm);
    handleSearch(searchTerm);
  }

  const handleCheckboxChange = (event) => {
    if (event.target.checked) {
      setSearchLatest("_by_date");
    } else {
      setSearchLatest("");
    }
    handleSearch(searchTerm);
  }

  const handleMoreRequest = () => {
    dispatchStories({
      type: "UPDATE_PAGE",
      payload: stories.page + 1
    })
  }

  const lastSearches = searchRequests.slice(0, -1).reverse();

  return (
    <StyledContainer>
      <StyledHeadlinePrimary>Hacker News Fetcher</StyledHeadlinePrimary>

      <SearchForm
        searchTerm={searchTerm}
        onSearchInput={handleSearchInput}
        onSearchSubmit={handleSearchSubmit}
        onCheckboxChange={handleCheckboxChange}
      />

      <LastSearches lastSearches={lastSearches} onLastSearch={handleLastSearch} />

      {stories.isError && <p>Something went wrong...</p>}

      <List list={stories.data} onRemoveItem={handleRemoveStory} />

      {stories.isLoading ? (
        <p style={{ textAlign: "center" }}>Loading...</p>
      ) : (
        <ButtonMore onMoreRequest={handleMoreRequest} />
      )}
    </StyledContainer>

  );
};

export default App;
