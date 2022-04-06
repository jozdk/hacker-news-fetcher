import React, { useState, useEffect, useRef, useReducer, useCallback } from "react";

const API_ENDPOINT = "https://hn.algolia.com/api/v1/search?query="

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
  const [stories, dispatchStories] = useReducer(storiesReducer, { data: [], isLoading: false, isError: false });
  const [url, setUrl] = useState(`${API_ENDPOINT}${searchTerm}`);

  const handleFetchStories = useCallback(() => {
    if (!searchTerm) return;

    dispatchStories({ type: "STORIES_FETCH_INIT" });

    fetch(url)
      .then((response) => response.json())
      .then((result) => {
        dispatchStories({
          type: "STORIES_FETCH_SUCCESS",
          payload: result.hits
        });
      })
      .catch(() => dispatchStories({ type: "STORIES_FETCH_FAILURE" }));
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

  const handleSearchSubmit = () => {
    setUrl(`${API_ENDPOINT}${searchTerm}`);
  }

  return (
    <div>
      <h1>My Hacker Stories</h1>

      <InputWithLabel
        id="search"
        value={searchTerm}
        isFocused
        onInputChange={handleSearchInput}
      >
        <strong>Search:</strong>
      </InputWithLabel>

      <button
        type="button"
        disabled={!searchTerm}
        onClick={handleSearchSubmit}
      >
        Submit
      </button>

      <hr />

      {stories.isError && <p>Something went wrong...</p>}

      {stories.isLoading ? (
        <p>Loading...</p>
      ) : (
        <List list={stories.data} onRemoveItem={handleRemoveStory} />
      )}

    </div>
  );
};

const List = ({ list, onRemoveItem }) => (
  <ul>
    {list.map((item) => <Item
      key={item.objectID}
      item={item}
      onRemoveItem={onRemoveItem}
    />)}
  </ul>
);

const Item = ({ item, onRemoveItem }) => {
  return (
    <li>
      <span>
        <a href={item.url}>{item.title}</a>
      </span>
      <span>{item.author}</span>
      <span>{item.num_comments}</span>
      <span>{item.points}</span>
      <span>
        <button type="button" onClick={() => onRemoveItem(item)}>
          Dismiss
        </button>
      </span>
    </li>
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
      <label htmlFor={id}>{children}</label>
      &nbsp;
      <input
        ref={inputRef}
        type={type}
        id={id}
        value={value}
        autoFocus
        onChange={onInputChange}
      />
    </>
  )
};

export default App;
