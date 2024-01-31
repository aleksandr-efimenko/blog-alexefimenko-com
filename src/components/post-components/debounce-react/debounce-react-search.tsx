import { useState, useRef } from 'react'
import { LoadingCircle } from '@/components/ui/loading-circle'
import { countries } from './countries'

// set delay for debounce function in milliseconds
const DELAY = 1000

export default function DebounceReactSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResult, setSearchResult] = useState<string[]>([])
  const debounceTimeout = useRef<any>(null)

  // Search function
  const performSearch = (query: string) => {
    if (query.length === 0) {
      setSearchResult([])
      return
    }
    // Filter and sort results
    const result = countries.filter((country) => country.toLowerCase().includes(query.toLowerCase())).sort()
    setSearchResult(result)
  }

  // Debounce function
  function debounce(func: Function, delay: number) {
    return function (...args: any[]) {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current)
      debounceTimeout.current = setTimeout(() => {
        func(...args)
        debounceTimeout.current = null
      }, delay)
    }
  }

  // Debounced search function
  const debouncedSearch = debounce(performSearch, DELAY)

  // Event handler for input changes
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    setSearchTerm(value)
    debouncedSearch(value)
  }

  // Message to display when there is a delay
  const delayMessage = (
    <>
      <p>Delay in effect while typing... </p>
      <p>Search will run after 1 second of inactivity.</p>
    </>
  )
  const searchResultEmpty = searchResult?.length === 0
  // get first 10 results
  const searchResultList = searchResult.slice(0, 10).map((c) => <li key={c}>{c}</li>)
  return (
    <div
      className='flex flex-col gap-5 items-center 
      bg-gray-100 dark:text-white text-gray-800
      justify-center w-full dark:bg-gray-700 overflow-clip pt-5 
    '
    >
      <div className='h-24'>{debounceTimeout.current && delayMessage}</div>
      <div className='flex gap-5 h-16  items-center'>
        <label htmlFor='search-input' className='text-xl'>
          Search:
        </label>
        <input
          className='border-2 border-gray-300 rounded-md px-3 py-2 text-lg'
          type='text'
          id='search-input'
          value={searchTerm}
          onChange={handleInputChange}
          placeholder='Type to search...'
        />
        <div className='w-12 h-12'>{debounceTimeout.current && <LoadingCircle />}</div>
      </div>
      <div className='h-64 w-96'>
        {{ searchResultEmpty } && <ul className='text-left list-disc list-inside text-lg'>{searchResultList}</ul>}
        {searchResultEmpty && searchTerm.length > 0 && !debounceTimeout.current && (
          <div className='text-lg animate-pulse'>No results found</div>
        )}
      </div>
    </div>
  )
}
