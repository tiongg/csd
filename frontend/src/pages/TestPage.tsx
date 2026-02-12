import React, { useState, useEffect } from 'react';

// made this for testing can remove -kz


const API_BASE = 'http://localhost:8080/api';

function TestPage() {
  const [token, setToken] = useState(localStorage.getItem('jwt') || '');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Team states
  const [teams, setTeams] = useState([]);
  const [teamName, setTeamName] = useState('');
  const [teamDesc, setTeamDesc] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [memberEmail, setMemberEmail] = useState('');
  
  // Course states
  const [courses, setCourses] = useState([]);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');

  const headers = { 
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };

  // Auth
  const register = async () => {
    const res = await fetch(`${API_BASE}/account`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password })
    });
    if (res.ok) alert('Registered!');
    else alert('Error: ' + await res.text());
  };

  const login = async () => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernameOrEmail: username, password })
    });
    if (res.ok) {
      const data = await res.json();
      setToken(data.accessToken);
      localStorage.setItem('jwt', data.accessToken);
      alert('Logged in!');
    } else {
      alert('Login failed');
    }
  };

  // Teams
  const fetchTeams = async () => {
    const res = await fetch(`${API_BASE}/teams`, { headers });
    if (res.ok) setTeams(await res.json());
  };

  const createTeam = async () => {
    const res = await fetch(`${API_BASE}/teams`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: teamName, description: teamDesc })
    });
    if (res.ok) {
      alert('Team created!');
      fetchTeams();
      setTeamName('');
      setTeamDesc('');
    }
  };

  const deleteTeam = async (id) => {
    const res = await fetch(`${API_BASE}/teams/${id}`, {
      method: 'DELETE',
      headers
    });
    if (res.ok) {
      alert('Team deleted!');
      fetchTeams();
    }
  };

  const addMember = async () => {
    // First get account by email
    const accountRes = await fetch(`${API_BASE}/account?email=${memberEmail}`, { headers });
    if (!accountRes.ok) {
      alert('Account not found');
      return;
    }
    const account = await accountRes.json();
    
    const res = await fetch(`${API_BASE}/teams/${selectedTeam}/members`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ accountId: account.id, teamRole: 'CONTRIBUTOR' })
    });
    if (res.ok) {
      alert('Member added!');
      setMemberEmail('');
    }
  };

  // Courses
  const fetchCourses = async () => {
    const res = await fetch(`${API_BASE}/courses`, { headers });
    if (res.ok) setCourses(await res.json());
  };

  const createCourse = async () => {
    const res = await fetch(`${API_BASE}/courses`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ title: courseTitle, description: courseDesc })
    });
    if (res.ok) {
      alert('Course created!');
      fetchCourses();
      setCourseTitle('');
      setCourseDesc('');
    }
  };

  const deleteCourse = async (id) => {
    const res = await fetch(`${API_BASE}/courses/${id}`, {
      method: 'DELETE',
      headers
    });
    if (res.ok) {
      alert('Course deleted!');
      fetchCourses();
    }
  };

  useEffect(() => {
    if (token) {
      fetchTeams();
      fetchCourses();
    }
  }, [token]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">API Test Page</h1>
      
      {/* Auth Section */}
      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-bold mb-4">Authentication</h2>
        <input 
          placeholder="Email" 
          value={email} 
          onChange={e => setEmail(e.target.value)}
          className="border p-2 mr-2"
        />
        <input 
          placeholder="Username" 
          value={username} 
          onChange={e => setUsername(e.target.value)}
          className="border p-2 mr-2"
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={e => setPassword(e.target.value)}
          className="border p-2 mr-2"
        />
        <button onClick={register} className="bg-green-500 text-white px-4 py-2 rounded mr-2">
          Register
        </button>
        <button onClick={login} className="bg-blue-500 text-white px-4 py-2 rounded">
          Login
        </button>
        {token && <p className="mt-2 text-sm text-green-600">✓ Logged in</p>}
      </div>

      {/* Teams Section */}
      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-bold mb-4">Teams</h2>
        <div className="mb-4">
          <input 
            placeholder="Team Name" 
            value={teamName} 
            onChange={e => setTeamName(e.target.value)}
            className="border p-2 mr-2"
          />
          <input 
            placeholder="Description" 
            value={teamDesc} 
            onChange={e => setTeamDesc(e.target.value)}
            className="border p-2 mr-2"
          />
          <button onClick={createTeam} className="bg-blue-500 text-white px-4 py-2 rounded">
            Create Team
          </button>
        </div>
        
        <div className="space-y-2">
          {teams.map(team => (
            <div key={team.id} className="flex justify-between items-center p-2 bg-gray-100 rounded">
              <div>
                <strong>{team.name}</strong> - {team.description}
                <div className="text-sm text-gray-600">Members: {team.members?.length || 0}</div>
              </div>
              <div>
                <button 
                  onClick={() => setSelectedTeam(team.id)} 
                  className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                >
                  Add Member
                </button>
                <button 
                  onClick={() => deleteTeam(team.id)} 
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {selectedTeam && (
          <div className="mt-4 p-3 bg-yellow-50 rounded">
            <h3 className="font-bold mb-2">Add Member to Team</h3>
            <input 
              placeholder="Member Email" 
              value={memberEmail} 
              onChange={e => setMemberEmail(e.target.value)}
              className="border p-2 mr-2"
            />
            <button onClick={addMember} className="bg-green-500 text-white px-4 py-2 rounded">
              Add
            </button>
            <button 
              onClick={() => setSelectedTeam(null)} 
              className="ml-2 bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Courses Section */}
      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-bold mb-4">Courses</h2>
        <div className="mb-4">
          <input 
            placeholder="Course Title" 
            value={courseTitle} 
            onChange={e => setCourseTitle(e.target.value)}
            className="border p-2 mr-2"
          />
          <input 
            placeholder="Description" 
            value={courseDesc} 
            onChange={e => setCourseDesc(e.target.value)}
            className="border p-2 mr-2"
          />
          <button onClick={createCourse} className="bg-blue-500 text-white px-4 py-2 rounded">
            Create Course
          </button>
        </div>
        
        <div className="space-y-2">
          {courses.map(course => (
            <div key={course.id} className="flex justify-between items-center p-2 bg-gray-100 rounded">
              <div>
                <strong>{course.title}</strong> - {course.description}
              </div>
              <button 
                onClick={() => deleteCourse(course.id)} 
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TestPage;