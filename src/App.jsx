// App.jsx
import { useState, useEffect } from "react";
import { FormControl, InputGroup, Container, Button, Row, Card } from "react-bootstrap";
import "./App.css";


const clientId = import.meta.env.VITE_CLIENT_ID;
const clientSecret = import.meta.env.VITE_CLIENT_SECRET;


function App() {
  const [albums, setAlbums] = useState([]); //initializes albums state here
  const [searchInput, setSearchInput] = useState(""); //initializes search as an empty string
  const [accessToken, setAccessToken] = useState("");


 
  const handleInputChange = (event) => { //user types, function updates search state with new input value
    setSearchInput(event.target.value);
  };


  //handles enter key
  const handleKeyDown = (event) => {
    if (event.key === "Enter") { //if enter key is clicked, it triggers the handleSearch function
      handleSearch();
    }
  };


  //function to handle search button click
  const handleSearch = () => {
    console.log("Searching for:", searchInput);
    search(); //calls the search function directly
  };


  useEffect(() => {
    let authParams = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body:
        "grant_type=client_credentials&client_id=" +
        clientId +
        "&client_secret=" +
        clientSecret,
    };


    fetch("https://accounts.spotify.com/api/token", authParams)
      .then((result) => result.json())
      .then((data) => {
        setAccessToken(data.access_token);
      });
  }, []);


  async function search() {
    let artistParams = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    };
 
    //get artist
    const artistID = await fetch(
      "https://api.spotify.com/v1/search?q=" + searchInput + "&type=artist",
      artistParams
    )
      .then((result) => result.json())
      .then((data) => {
        return data.artists.items[0]?.id; 
      });


    if (artistID) {
      //get artist albums
      await fetch(
        "https://api.spotify.com/v1/artists/" + artistID +
        "/albums?include_groups=album&market=US&limit=50", artistParams
      )
      .then((result) => result.json())
      .then((data) => {
        setAlbums(data.items);
      });
 
      console.log("Search Input: " + searchInput);
      console.log("Artist ID: " + artistID);
    } else {
      console.log("No artist found for the search input.");
    }
  }


  return (
    <Container>
      <InputGroup>
        <FormControl
          placeholder="Search For Artist"
          type="text"
          aria-label="Search for an Artist"
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
          value={searchInput}
          style={{
            width: "300px",
            height: "35px",
            borderWidth: "0px",
            borderStyle: "solid",
            borderRadius: "5px",
            marginRight: "10px",
            paddingLeft: "10px",
          }}
        />
        <Button onClick={handleSearch}>Search</Button>
      </InputGroup>


      <Row
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-around",
          alignContent: "center",
          marginTop: "20px",
        }}
      >
        {albums.map((album) => {
          const albumImage = album.images.length > 0 ? album.images[0].url : 'path/to/default/image.jpg'; //added error handling
          return (
            <Card
              key={album.id}
              style={{
                backgroundColor: "white",
                margin: "10px",
                borderRadius: "5px",
                marginBottom: "30px",
                width: "200px",
              }}
            >
              <Card.Img
                width={200}
                src={albumImage}
                style={{ borderRadius: '4%' }}
                alt={`Album cover for ${album.name}`} //for accessibility
              />
              <Card.Body>
                <Card.Title
                  style={{
                    whiteSpace: 'wrap',
                    fontWeight: 'bold',
                    maxWidth: '200px',
                    fontSize: '18px',
                    marginTop: '10px',
                    color: 'black',
                  }}
                >
                  {album.name}
                </Card.Title>


                <Card.Text style={{ color: 'black' }}>
                  Release Date: <br /> {album.release_date}
                </Card.Text>


                <Button
                  href={album.external_urls.spotify}
                  style={{
                    backgroundColor: 'black',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '15px',
                    borderRadius: '5px',
                    padding: '10px',
                  }}
                >
                  Album Link
                </Button>
              </Card.Body>
            </Card>
          );
        })}
      </Row>
    </Container>
  );
}


export default App;
