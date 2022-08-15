import React, { useState, useEffect, useRef, useReducer, useCallback } from "react";
import axios from "axios";
import { sortBy } from "lodash";
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
import { IconChevron } from "./icons/IconChevron.jsx";

const API_ENDPOINT = "https://hn.algolia.com/api/v1/search";
const SORTS = {
  NONE: (list) => list,
  TITLE: (list) => sortBy(list, "title"),
  AUTHOR: (list) => sortBy(list, "author"),
  COMMENT: (list) => sortBy(list, "num_comments").reverse(),
  POINT: (list) => sortBy(list, "points").reverse(),
  CREATED_AT: (list) => sortBy(list, "created_at").reverse()
}

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

const getURL = (searchTerm, searchLatest) => {
  return `${API_ENDPOINT}${searchLatest}?query=${searchTerm}&tags=story`;
}

const App = () => {
  // const [searchTerm, setSearchTerm] = useState(localStorage.getItem("search") || "");
  const [searchTerm, setSearchTerm] = useSemiPersistentState("search", "React");
  const [searchLatest, setSearchLatest] = useState("");
  const [stories, dispatchStories] = useReducer(storiesReducer, { data: [], isLoading: false, isError: false });
  const [url, setUrl] = useState(getURL(searchTerm, searchLatest));

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
    setUrl(getURL(searchTerm, searchLatest));

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

const List = ({ list, onRemoveItem }) => {
  const [sort, setSort] = useState({
    sortKey: "NONE",
    isReverse: false
  });

  const handleSort = (sortKey) => {
    const isReverse = sort.sortKey === sortKey && !sort.isReverse;
    setSort({
      sortKey,
      isReverse
    });
  }

  const sortFunction = SORTS[sort.sortKey];
  const sortedList = sort.isReverse
    ? sortFunction(list).reverse()
    : sortFunction(list);

  return (
    <ul>
      <ListHead sort={sort} handleSort={handleSort} />
      {sortedList.map((item) => <Item
        key={item.objectID}
        item={item}
        onRemoveItem={onRemoveItem}
      />)}
    </ul>
  )
};

const ListHead = ({ sort, handleSort }) => {
  return (
    <StyledHeadItem>
      <StyledColumn width="40%">
        Title
        <IconChevron sort={sort} column="TITLE" handleSort={handleSort} />
      </StyledColumn>
      <StyledColumn width="20%">
        Author
        <IconChevron sort={sort} column="AUTHOR" handleSort={handleSort} />
      </StyledColumn>
      <StyledColumn width="10%">
        Comments
        <IconChevron sort={sort} column="COMMENT" handleSort={handleSort} />
      </StyledColumn>
      <StyledColumn width="10%">
        Points
        <IconChevron sort={sort} column="POINT" handleSort={handleSort} />
      </StyledColumn>
      <StyledColumn width="10%">
        Date
        <IconChevron sort={sort} column="CREATED_AT" handleSort={handleSort} />
      </StyledColumn>
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
      <StyledColumn width="20%">{item.author}</StyledColumn>
      <StyledColumn width="10%">{item.num_comments}</StyledColumn>
      <StyledColumn width="10%">{item.points}</StyledColumn>
      <StyledColumn width="10%">{new Date(item.created_at).toLocaleDateString("fr")}</StyledColumn>
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
