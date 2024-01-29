---
title: Implementing Debounce in React for Efficient Delayed Search Queries
description: In this article, we will look at how to implement debounce in React for efficient delayed search queries. We will look at how to implement debounce in React using the useRef hook.
tags: [javascript, fundamentals, react]
date: 2024-01-08
image: /blog-assets/debounce-react/cover.png
thumbnail: /blog-assets/debounce-react/cover.png
---

In this article, we will look at how to implement debounce in React for efficient delayed search queries. The problem we are trying to solve is that we want to make an API call to search for a user after the user has stopped typing for 1s (in real life, it would be more like 300ms). It will make the API calls more efficient and reduce the load on the server.

We will use the debounce function from my previous article [Let’s implement a Debounce function in Javascript](https://alexefimenko.com/blog/debounce-function). But we will need to adjust it a bit to use it in a React component.

You can check how it works in the CodeSandbox below:

<iframe src="https://codesandbox.io/embed/jw28mj?view=preview&hideNavigation=1"
     style="width:100%; height: 500px; border:0; border-radius: 4px; overflow:hidden;"
     title="debounce-react-search"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

The main problem to use the debounce function in React is that we need to store the timer ID between renders. If we just use a useState hook, the timer ID will be reset on every render. So for this, we will use the useRef hook as it is [recommended by the React team](Let’s implement a Debounce function in Javascript).

Let's adjust the debounce function to use the useRef hook:

```javascript
const debounceTimeout = (useRef < NodeJS.Timeout) | (null > null)

function debounce(func, delay: number) {
  return function (...args: []) {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current)
    debounceTimeout.current = setTimeout(() => {
      func(...args)
      debounceTimeout.current = null
    }, delay)
  }
}
```

We are going to search through a list of countries. We will use the useState hook to store the search term and the search result. We will use the debounce function to create a debounced search function that will be called after the wait time has passed:

```javascript
const [searchTerm, setSearchTerm] = useState("");
const [searchResult, setSearchResult] = useState<string[]>([]);

const performSearch = (query: string) => {
  if (query.length === 0) {
    setSearchResult([]);
    return;
  }
  const result = countries
    .filter((country) => country.toLowerCase().includes(query.toLowerCase()))
    .sort();
  setSearchResult(result);
};
```

So the debounced search function will look like this:

```javascript
const debouncedSearch = debounce(performSearch, DELAY)
```

We will use the debounced search function in the input change handler:

```javascript
const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const { value } = event.target
  setSearchTerm(value)
  debouncedSearch(value)
}
```

I prefer using Tailwind CSS for styling, so I added some styling to the component. The full code of the component is below.
You also can check my GitHub repository [debounce-react](https://github.com/aleksandr-efimenko/debounce-react-sandbox) for the full code.

```javascript
import { useState, useRef } from "react";
import { countries } from "./countries";
import "./App.css";

// set delay for debounce function in milliseconds
const DELAY = 1000;

export default function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState<string[]>([]);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Search function
  const performSearch = (query: string) => {
    if (query.length === 0) {
      setSearchResult([]);
      return;
    }
    const result = countries
      .filter((country) => country.toLowerCase().includes(query.toLowerCase()))
      .sort();
    setSearchResult(result);
  };

  // Debounce function
  function debounce(func, delay: number) {
    return function (...args: []) {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
      debounceTimeout.current = setTimeout(() => {
        func(...args);
        debounceTimeout.current = null;
      }, delay);
    };
  }

  // Debounced search function
  const debouncedSearch = debounce(performSearch, DELAY);

  // Event handler for input changes
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const searchResultEmpty = searchResult?.length === 0;
  // get first 20 results
  const searchResultList = searchResult
    .slice(0, 10)
    .map((c) => <li key={c}>{c}</li>);
  return (
    <div className="flex flex-col gap-5">
      <div className="h-12">
        {debounceTimeout.current &&
          "Wait until the search function is executed"}
      </div>
      <div className="flex items-center gap-5">
        <label htmlFor="search-input" className="text-xl">
          Search:
        </label>
        <input
          className="rounded-md border-2 border-gray-300 px-3 py-2 text-lg"
          type="text"
          id="search-input"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder="Type to search..."
        />
        <div className="w-12">
          {debounceTimeout.current && <LoadingCircle />}
        </div>
      </div>
      <div className="h-64">
        {{ searchResultEmpty } && (
          <ul className="list-inside list-disc text-left text-lg">
            {searchResultList}
          </ul>
        )}
        {searchResultEmpty &&
          searchTerm.length > 0 &&
          !debounceTimeout.current && (
            <div className="animate-pulse text-lg">No results found</div>
          )}
      </div>
    </div>
  );
}

function LoadingCircle() {
  return (
    <svg
      className="h-12 w-12 animate-spin text-gray-700"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-50"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      ></path>
    </svg>
  );
}
```

I hope you found this article useful. If you have any questions or comments, please let me know in the comments below.
