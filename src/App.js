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
  StyledCheckmark,
  StyledList
} from "./StyledComponents";
import { LastSearches } from "./components/LastSearches.jsx";
import { ButtonMore } from "./components/ButtonMore.jsx";
import { IconChevron } from "./components/icons/IconChevron.jsx";

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
      // console.log(url);
      const result = await axios.get(url);
      console.log(stories.page, result.data.page)
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
    <StyledList>
      <ListHead sort={sort} handleSort={handleSort} />
      {sortedList.map((item) => (
        <Item
          key={item.objectID}
          item={item}
          onRemoveItem={onRemoveItem}
        />
      ))}
    </StyledList>
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
      <StyledColumn width="10%">
        Action
      </StyledColumn>
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
