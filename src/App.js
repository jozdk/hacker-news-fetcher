import React, { useState, useEffect, useRef, useReducer, useCallback } from "react";
import axios from "axios";
import {
  StyledContainer,
  StyledHeadlinePrimary,
  StyledHeadItem,
  StyledItem,
  StyledColumn,
  StyledButtonSmall,
  StyledButtonLarge,
  StyledSearchForm,
  StyledLabel,
  StyledInput,
  StyledCheckboxContainer,
  StyledCheckmark
} from "./StyledComponents";

const API_ENDPOINT = "https://hn.algolia.com/api/v1/search";

// Custom Hook
const useSemiPersistentState = (key, initialState) => {
  const [value, setValue] = useState(localStorage.getItem(key) || initialState);

  useEffect(() => {
    localStorage.setItem(key, value);
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
        data: action.payload
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
    default:
      throw new Error();
  }
}

const App = () => {
  // const [searchTerm, setSearchTerm] = useState(localStorage.getItem("search") || "");
  const [searchTerm, setSearchTerm] = useSemiPersistentState("search", "React");
  const [searchLatest, setSearchLatest] = useState(false);
  const [stories, dispatchStories] = useReducer(storiesReducer, { data: [], isLoading: false, isError: false });
  const [url, setUrl] = useState(`${API_ENDPOINT}${searchLatest ? "_by_date" : ""}?query=${searchTerm}&tags=story`);

  const handleFetchStories = useCallback(async () => {
    dispatchStories({ type: "STORIES_FETCH_INIT" });

    try {
      const result = await axios.get(url);

      dispatchStories({
        type: "STORIES_FETCH_SUCCESS",
        payload: result.data.hits
      });
    } catch {
      dispatchStories({ type: "STORIES_FETCH_FAILURE" });
    }

  }, [url]);

  useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);

  useEffect(() => {
    localStorage.setItem("search", searchTerm);
  }, [searchTerm]); // Only re-run the effect if searchTerm changes

  const handleRemoveStory = (item) => {
    dispatchStories({
      type: "REMOVE_STORY",
      payload: item
    });
  }

  const handleSearchInput = (event) => {
    setSearchTerm(event.target.value);
  }

  const handleSearchSubmit = (event) => {
    setUrl(`${API_ENDPOINT}${searchLatest ? "_by_date" : ""}?query=${searchTerm}&tags=story`);

    event.preventDefault();
  }

  const handleCheckboxChange = (event) => {
    if (event.target.checked) {
      setSearchLatest("_by_date");
    } else {
      setSearchLatest("");
    }
  }

  useEffect(() => {
    console.log(url)
  }, [url]);

  return (
    <StyledContainer>
      <StyledHeadlinePrimary>My Hacker Stories</StyledHeadlinePrimary>

      <SearchForm
        searchTerm={searchTerm}
        onSearchInput={handleSearchInput}
        onSearchSubmit={handleSearchSubmit}
        onCheckboxChange={handleCheckboxChange}
      />

      {stories.isError && <p>Something went wrong...</p>}

      {stories.isLoading ? (
        <p>Loading...</p>
      ) : (
        <List list={stories.data} onRemoveItem={handleRemoveStory} />
      )}
    </StyledContainer>

  );
};

const List = ({ list, onRemoveItem }) => (
  <ul>
    <ListHead />
    {list.map((item) => <Item
      key={item.objectID}
      item={item}
      onRemoveItem={onRemoveItem}
    />)}
  </ul>
);

const ListHead = () => {
  return (
    <StyledHeadItem>
      <StyledColumn width="40%">Title</StyledColumn>
      <StyledColumn width="30%">Author</StyledColumn>
      <StyledColumn width="10%">Comments</StyledColumn>
      <StyledColumn width="10%">Points</StyledColumn>
      <StyledColumn width="10%"></StyledColumn>
    </StyledHeadItem>
  )
}

const Item = ({ item, onRemoveItem }) => {
  return (
    <StyledItem>
      <StyledColumn width="40%">
        <a href={item.url}>{item.title}</a>
      </StyledColumn>
      <StyledColumn width="30%">{item.author}</StyledColumn>
      <StyledColumn width="10%">{item.num_comments}</StyledColumn>
      <StyledColumn width="10%">{item.points}</StyledColumn>
      <StyledColumn width="10%">
        <StyledButtonSmall type="button" onClick={() => onRemoveItem(item)}>
          Dismiss
        </StyledButtonSmall>
      </StyledColumn>
    </StyledItem>

  );
}

const InputWithLabel = ({ id, value, type = "text", onInputChange, isFocused, children }) => {
  const inputRef = useRef();

  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  return (
    <>
      <StyledLabel htmlFor={id}>{children}</StyledLabel>
      &nbsp;
      <StyledInput
        ref={inputRef}
        type={type}
        id={id}
        value={value}
        autoFocus
        onChange={onInputChange}
      />
    </>

  );
};

const Checkbox = ({ label, onInputChange }) => {
  return (
    <StyledCheckboxContainer>{label}
        <input type="checkbox" onClick={onInputChange} />
        <StyledCheckmark></StyledCheckmark>
    </StyledCheckboxContainer>
  )
}

const SearchForm = ({ searchTerm, onSearchInput, onSearchSubmit, onCheckboxChange }) => {
  return (
    <StyledSearchForm onSubmit={onSearchSubmit}>
      <InputWithLabel
        id="search"
        value={searchTerm}
        isFocused
        onInputChange={onSearchInput}
      >
        <strong>Search:</strong>
      </InputWithLabel>

      <StyledButtonLarge type="submit" disabled={!searchTerm}>
        Submit
      </StyledButtonLarge>
      <Checkbox label="Latest" onInputChange={onCheckboxChange} />
    </StyledSearchForm>
  )
}

export default App;
