import React from 'react'

export default function Students(){

  const students = [
    { id: 1, firstName: "Juan", lastName: "Dela Cruz", year: "1st", program: "BSCS" },
    { id: 2, firstName: "Maria", lastName: "Santos", year: "2nd", program: "BSIT" },
    { id: 3, firstName: "Jose", lastName: "Reyes", year: "3rd", program: "BSECE" },
  ];

  return (

    <div className='cardcontent'>
      
      <form className="search-form">
        <div className="search-container">
          <label htmlFor="search-dropdown" className="sr-only">
            Search
          </label>

          {/* Dropdown Button */}
          <button
            id="dropdown-button"
            type="button"
            className="dropdown-btn"
          >
            All categories
            <svg
              className="dropdown-icon"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 10 6"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 4 4 4-4"
              />
            </svg>
          </button>

          {/* Dropdown Menu */}
          <div id="dropdown" className="dropdown-menu hidden">
            <ul aria-labelledby="dropdown-button">
              <li><button type="button">Mockups</button></li>
              <li><button type="button">Templates</button></li>
              <li><button type="button">Design</button></li>
              <li><button type="button">Logos</button></li>
            </ul>
          </div>

          {/* Search Input */}
          <div className="search-box">
            <input
              type="search"
              id="search-dropdown"
              placeholder="Search Mockups, Logos, Design Templates..."
              required
            />
            <button type="submit" className="search-btn">
              <svg
                className="search-icon"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
              <span className="sr-only">Search</span>
            </button>
          </div>
        </div>
      </form>

      <table className="student-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Year Level</th>
            <th>Program</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>{student.id}</td>
              <td>{student.firstName}</td>
              <td>{student.lastName}</td>
              <td>{student.year}</td>
              <td>{student.program}</td>
            </tr>
          ))}
        </tbody>
      </table>

      

    </div>
  )
}
