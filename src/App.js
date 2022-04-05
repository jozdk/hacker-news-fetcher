import React, { useState, useEffect } from "react";

// Custom Hook
const useSemiPersistentState = (key, initialState) => {
  const [value, setValue] = useState(localStorage.getItem(key) || initialState);

  useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key]);
  
  return [value, setValue];
}

const App = () => {
  const stories = [
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

  // const [searchTerm, setSearchTerm] = useState(localStorage.getItem("search") || "");
  const [searchTerm, setSearchTerm] = useSemiPersistentState("search", "React");

  useEffect(() => {
    localStorage.setItem("search", searchTerm);
  }, [searchTerm]); // Only re-run the effect if searchTerm changes

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  }

  const searchedStories = stories.filter((story) => story.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div>
      <h1>My Hacker Stories</h1>

      <Search onSearch={handleSearch} search={searchTerm} />

      <hr />

      <List list={searchedStories} />
    </div>
  );
};

const List = ({ list }) => (
  <ul>
    {list.map((item) => <Item key={item.objectID} item={item} />)}
  </ul>
);

const Item = ({ item }) => (
  <li>
    <span>
      <a href={item.url}>{item.title}</a>
    </span>
    <span>{item.author}</span>
    <span>{item.num_comments}</span>
    <span>{item.points}</span>
  </li>
);

const Search = ({ onSearch, search }) => {
  return (
    <div>
      <label htmlFor="search">Search: </label>
      <input type="text" id="search" value={search} onChange={onSearch} />
    </div>
  )
};

export default App;
