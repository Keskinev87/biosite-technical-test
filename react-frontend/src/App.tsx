import React from 'react';
import './App.css';
import UserListContainer from './components/user-list-container';

const App: React.FC = () => {
  return (
    <div className="App">
      <UserListContainer />
    </div>
  );
}

export default App;
