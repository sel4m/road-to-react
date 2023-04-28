import React from "react";
import axios from "axios";
import styled from 'styled-components';

// need to change project structure, give components their own files and import them here 

const StyledContainer = styled.div`
height: 100vw;
padding: 20px;
background: #83a4d4;
background: linear-gradient(to left, #b6fbff, #83a4d4);
color: #171212;
`;

const StyledHeadlinePrimary = styled.h1`
font-size: 48px;
font-weight: 300;
letter-spacing: 2px;
`;

const StyledItem = styled.li`
display: flex;
align-items: center;
padding-bottom: 5px;
`;
const StyledColumn = styled.span`
padding: 0 5px;
white-space: nowrap;
overflow: hidden;
white-space: nowrap;
text-overflow: ellipsis;

a {
  color: inherit;
}

width: ${(props) => props.width};
`;

const StyledButton = styled.button`
background: transparent;
border: 1px solid #171212;
padding: 5px;
cursor: pointer;
transition: all 0.1s ease-in;
&:hover {
background: #171212;
color: #ffffff;
}
`;

const StyledButtonSmall = styled(StyledButton)`
padding: 5px;
`;

const StyledButtonLarge = styled(StyledButton)`
padding: 10px;
`;

const StyledSearchForm = styled.form`
padding: 10px 0 20px 0;
display: flex;
align-items: baseline;
`;

const StyledLabel = styled.label`
border-top: 1px solid #171212;
border-left: 1px solid #171212;
padding-left: 5px;
font-size: 24px;
`;
const StyledInput = styled.input`
border: none;
border-bottom: 1px solid #171212;
background-color: transparent;
font-size: 24px;
`;

const storiesReducer = (state, action) => {
  switch (action.type) {
    case 'STORIES_FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'STORIES_FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case 'STORIES_FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    case 'REMOVE_STORY':
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

const useSemiPersistentState = (
  key, initialState
) => {
  const isMounted = React.useRef(false);

  const [value, setValue] =
    React.useState(
      localStorage.getItem(key) || initialState
    )

  React.useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      console.log('A')
      localStorage.setItem(key, value);
    }
  }, [value, key]);

  return [value, setValue];
};

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

const getSumComments = (stories) => {
  console.log('C');
  return stories.data.reduce(
    (result, value) => result + value.num_comments,
    0
  );
};

const extractSearchTerm = (url) => url.replace(API_ENDPOINT, '');

const getLastSearches = (urls) =>
  urls.slice(-5).map(extractSearchTerm);

const getUrl = (searchTerm) => `${API_ENDPOINT}${searchTerm}`;

const App = () => {

  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React');

  // const [urls, setUrl] = React.useState(
  //   `${API_ENDPOINT}${searchTerm}`
  // );

  const [urls, setUrl] = React.useState([getUrl(searchTerm)]);

  const [stories, dispatchStories] = React.useReducer(
    storiesReducer,
    { data: [], isLoading: false, isError: false }
  );
  // const [isLoading, setIsLoading] = React.useState(false);
  // const [isError, setIsError] = React.useState(false);

  const handleFetchStories = React.useCallback(async () => {
    dispatchStories({ type: 'STORIES_FETCH_INIT' });

    try {
      const lastUrl = urls[urls.length - 1];
      const result = await axios.get(lastUrl);

      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS',
        payload: result.data.hits,
      });
    } catch {
      dispatchStories({ type: 'STORIES_FETCH_FAILURE' });
    }
  }, [urls]);

  React.useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);


  const handleRemoveStory = React.useCallback((item) => {
    // const newStories = stories.filter(
    //   (story) => item.objectID !== story.objectID
    // );
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item,
    });
  }, []);

  const handleSearchInput = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    // const url = (`${API_ENDPOINT}${searchTerm}`);
    // setUrl(urls.concat(url));
    handleSearch(searchTerm);

    event.preventDefault();
  };

  console.log('B:App');

  const sumComments = React.useMemo(() => getSumComments(stories), [
    stories,
  ]);

  const handleLastSearch = (searchTerm) => {
    // const url = `${API_ENDPOINT}${searchTerm}`;
    // setUrl(urls.concat(url));
    handleSearch(searchTerm);
  };
  
  const handleSearch = (searchTerm) => {
    const url = getUrl(searchTerm);
    setUrl(urls.concat(url));
    };
  
 
  const lastSearches = getLastSearches(urls);

  return (
    <StyledContainer>
      <StyledHeadlinePrimary>My Hacker Stories with {sumComments} comments.</StyledHeadlinePrimary>

      <SearchForm
        searchTerm={searchTerm}
        onSearchInput={handleSearchInput}
        onSearchSubmit={handleSearchSubmit}
      />

      {lastSearches.map((searchTerm, index) => (
        <button
          key={searchTerm + index}
          type="button"
          onClick={() => handleLastSearch(searchTerm)}
        >
          {searchTerm}
        </button>
      ))}

      {stories.isError && <p>Something went wrong ...</p>}

      {stories.isLoading ? (
        <p>Loading ...</p>
      ) : (
        <List list={stories.data} onRemoveItem={handleRemoveStory} />
      )}
    </StyledContainer>
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
      <StyledLabel htmlFor={id}>
        {children}
      </StyledLabel>
      &nbsp;
      <StyledInput
        ref={inputRef}
        id={id}
        type={type}
        value={value}
        onChange={onInputChange}
      />
    </>
  );
};

const SearchForm = ({
  searchTerm,
  onSearchInput,
  onSearchSubmit,
}) => (
  <StyledSearchForm onSubmit={onSearchSubmit}>
    <InputWithLabel
      id="search"
      value={searchTerm}
      onInputChange={onSearchInput}
    >
      <strong>Search:</strong>
    </InputWithLabel>

    <StyledButtonLarge type="submit" disabled={!searchTerm}>
      Submit
    </StyledButtonLarge>
  </StyledSearchForm>
);

const List = React.memo(
  ({ list, onRemoveItem }) =>
    console.log('B:List') || (
      <ul>
        <li style={{ display: 'flex' }}>
          <span style={{ width: '40%' }}>Title</span>
          <span style={{ width: '30%' }}>Author</span>
          <span style={{ width: '10%' }}>Comments</span>
          <span style={{ width: '10%' }}>Points</span>
          <span style={{ width: '10%' }}>Actions</span>
        </li>

        {list.map(item => (
          <Item
            key={item.objectID}
            item={item}
            onRemoveItem={onRemoveItem}
          />
        ))}
      </ul>
    )
);

const Item = ({ item, onRemoveItem }) => (
  <StyledItem display='flex'>
    <StyledColumn width="40%">
      <a href={item.url}>{item.title}</a>
    </StyledColumn>
    <StyledColumn width='30%'>{item.author}</StyledColumn>
    <StyledColumn width='10%' >{item.num_comments}</StyledColumn>
    <StyledColumn width='10%' >{item.points}</StyledColumn>
    <StyledColumn width='10%'>
      <StyledButtonSmall
        type="button"
        onClick={() => onRemoveItem(item)}
      >
        Remove
      </StyledButtonSmall>
    </StyledColumn>
  </StyledItem>
);





export default App;
