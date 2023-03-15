import React from "react";

const initialStories = [
  {
    title: 'React',
    url: 'https://reactjs.org/',
    author: 'Jordan Walke',
    num_comments: 3,
    points: 4,
    objectID: 0,
  },
  {
    title: 'Redux',
    url: 'https://redux.js.org/',
    author: 'Dan Abramov, Andrew Clark',
    num_comments: 2,
    points: 5,
    objectID: 1,
  },
];

const getAsyncStories = () =>
  new Promise((resolve) =>
    setTimeout(
    () => resolve({ data: { stories: initialStories } }),
    2000
    )
  );

// const storiesReducer = (state, action) => {
//   switch (action.type) {
//     case 'SET_STORIES' : 
//       return action.payload;
//     case 'REMOVE_STORY' :
//       return state.filter(
//         (story) => action.payload.objectID !== story.objectID 
//       );
//     default: 
//         throw new Error();
//   }
// };

const storiesReducer = (state, action) => {
  switch (action.type) {
    case 'STORIES_FETCH_INIT' : 
      return {
        ...state,
        isLoading: true, 
        isError: false,
      };
    case 'STORIES_FETCH_SUCCESS' :
      return {
        ...state,
        isLoading: false, 
        isError: false,
        data: action.payload,
      };
    case 'STORIES_FETCH_FAILURE' :
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    case 'REMOVE_STORY' : 
      return {
        ...state,
        data: state.data.filter(
          (story) => action.payload.objectID !== story.objectID
        ),
      };
    default: 
        throw new Error();
  }
};

const App = () => {
  const useSemiPersistentState = (key, initialState) => {
    const [value, setValue] =
      React.useState(
        localStorage.getItem(key) || initialState
      )

    React.useEffect(() => {
      localStorage.setItem(key, value);
    }, [value]);

    return [value, setValue];
  };

  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React');

  const [stories, dispatchStories] = React.useReducer(
    storiesReducer,
    { data: [], isLoading: false, isError: false }
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);

  React.useEffect(() => {
    dispatchStories({ type: 'STORIES_FETCH_INIT' });

    getAsyncStories()
      .then(result => {
      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS' ,
        payload: result.data.stories,
      });
    })
      .catch(() => 
        dispatchStories({ type: 'STORIES_FETCH_FAILURE' })
      );
  }, []);

 const handleRemoveStory = (item) => {
      const newStories = stories.filter(
        (story) => item.objectID !== story.objectID
      );
  
    dispatchStories({
      type: 'SET_STORIES',
      payload: newStories,
    });
};

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const searchedStories = stories.data.filter((story) =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <div>
      <h1>My Hacker Stories</h1>

      <InputWithLabel
        id="search"
        value={searchTerm}
        onInputChange={handleSearch}
      >
        <strong>Search:</strong>
      </InputWithLabel>

    {stories.isError && <p>Something went wrong ...</p>}

    {stories.isLoading ? (
      <p>Loading ...</p>
    ) : (
      <List 
        list={searchedStories} 
        onRemoveItem={handleRemoveStory} 
      />
    )}
      <hr />

    </div>
  );
};


const InputWithLabel = ({
  id,
  value,
  type = 'text',
  onInputChange,
  isFocused,
  children
}) => {
  const inputRef = React.useRef();

  React.useEffect(() => {
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
        id={id}
        type={type}
        value={value}
        onChange={onInputChange}
      />
    </>
  )
}

const Search = (props) => {
  const handleChange = (event) => {
    props.onSearch(event);
  }

  const handleMouseOver = (event) => {
  }

  return (
    <>
      <p>
        Searching for <strong>{props.value}</strong>
      </p>
    </>
  );
};

const List = ({ list, onRemoveItem }) =>
  list.map(item => (
    <Item
      key={item.objectID}
      item={item}
      onRemoveItem={onRemoveItem}
    />
  ));

const Item = ({ item, onRemoveItem }) => (
  <li>
    <span>
      <a href={item.url}>{item.title}</a>
    </span>
    <span>{item.author}</span>
    <span>{item.num_comments}</span>
    <span>{item.points}</span>
    <span>
      <button type="button" onClick={() => onRemoveItem(item)}>
        Remove
      </button>
    </span>
  </li>
);

export default App;
