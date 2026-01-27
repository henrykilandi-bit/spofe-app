console.log('TEST PAGE - Si vous voyez ce texte, React fonctionne!');

export default function TestPage() {
  return (
    <div style={{ 
      padding: '40px', 
      backgroundColor: 'white', 
      color: 'black',
      fontSize: '18px',
      fontFamily: 'Arial'
    }}>
      <h1>🚀 TEST SPOFE - PAGE VISIBLE</h1>
      <p>Si vous voyez ce texte, React fonctionne!</p>
      <p>Le problème n'est PAS React mais probablement:</p>
      <ul>
        <li>1. useAuth hook qui crash</li>
        <li>2. AuthContext qui n'est pas fourni</li>
        <li>3. Import qui échoue</li>
      </ul>
      <button onClick={() => alert('Click fonctionne!')}>Test JavaScript</button>
    </div>
  );
}
