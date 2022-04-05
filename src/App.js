import React, { useState, useEffect, useRef } from "react";

// Custom Hook
const useSemiPersistentState = (key, initialState) => {
  const [value, setValue] = useState(localStorage.getItem(key) || initialState);

  useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key]);

  return [value, setValue];
}

const App = () => {
  const initialStories = [
    {
      title: "React",
      url: "https://reactjs.org/",
      author: "Jordan Walke",
      num_comments: 3,
      points: 4,
      objectID: 0
    },
    {
      title: "Redux",
      url: "https://redux.js.org/",
      author: "Dan Abramov, Andrew Clark",
      num_comments: 2,
      points: 5,
      objectID: 1
    }
  ];

  const getAsyncStories = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: { stories: initialStories } })
      }, 2000);
    });
  };

  // const [searchTerm, setSearchTerm] = useState(localStorage.getItem("search") || "");
  const [searchTerm, setSearchTerm] = useSemiPersistentState("search", "");

  const [stories, setStories] = useState([]);

  useEffect(() => {
    getAsyncStories().then((result) => {
      setStories(result.data.stories);
    })
  }, []); // Only run side-effect once the component renders for the first time. This triggers a warning by CRA though:
  // React Hook useEffect has a missing dependency: 'getAsyncStories'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

  useEffect(() => {
    localStorage.setItem("search", searchTerm);
  }, [searchTerm]); // Only re-run the effect if searchTerm changes

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  }

  const handleRemoveStory = (item) => {
    const newStories = stories.filter((story) => item.objectID !== story.objectID);
    setStories(newStories);
  }

  const searchedStories = stories.filter((story) => story.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div>
      <h1>My Hacker Stories</h1>

      <InputWithLabel
        id="search"
        value={searchTerm}
        isFocused
        onInputChange={handleSearch}
      >
        Search:
      </InputWithLabel>

      <hr />

      <List list={searchedStories} onRemoveItem={handleRemoveStory} />
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
