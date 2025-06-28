import { useEffect } from 'react';
import axios from 'axios';

function App() {
  useEffect(() => {
    axios.get('http://localhost:5000/')
      .then(res => console.log(res.data))
      .catch(err => console.error('API Error:', err));
  }, []);

  return <h1 className="text-3xl text-green-600">Daily Deals Store</h1>;
}

export default App;
