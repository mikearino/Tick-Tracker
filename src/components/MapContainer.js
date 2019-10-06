import React from "react";
import { Map, GoogleApiWrapper, InfoWindow, Marker } from "google-maps-react";
import firebase from "./Firebase.js";
import { Button } from "react-bootstrap";
import { isAbsolute } from "path";

const mapStyles = {
  position: "absolute",
  top: "4%",
  marginLeft: "3%",
  marginRight: "3%",
  height: "80%"
};

const formStyles = {
  position: "relative",
  top: "80px"
};

export class MapContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lats: "",
      longs: "",
      name: "",
      info: "",
      showingInfoWindow: false,
      activeMarker: {},
      selectedPlace: {},
      markers: []
    };
  }

  componentDidMount = () => {
    //grabs reference point in firebase db
    const pinsRef = firebase.database().ref("pins");
    //looks for initial data and whenever data is changed
    pinsRef.on("value", snapshot => {
      //variable holding snapshots value
      let markersFromDB = snapshot.val();
      // {-Lpp1zN2ifK9250eTE20: {latsValue: "33", longsValue: "44"}}
      //new array
      let newMarkerState = [];

      //iterates through pins from the DB and pushes data in to new array
      for (let markerID in markersFromDB) {
        // {"1234": {lat: 123, long: 678}, "345": {lat: 234, long: 45}...}
        const markerValue = markersFromDB[markerID];
        const lats = markerValue.latsValue;
        const longs = markerValue.longsValue;
        const info = markerValue.infoValue;
        const name = markerValue.nameValue;
        newMarkerState.push({
          id: markerID,
          latitude: lats,
          longitude: longs,
          placeName: name,
          placeInfo: info
        });
      }
      // sets new state to the pushed array
      this.setState({
        markers: newMarkerState
      });
    });
  };

  //shows info window by passing in marker and place changing info window state to true
  onMarkerClick = (props, marker, e) => {
    console.log({ props });
    this.setState({
      selectedPlace: props,
      activeMarker: marker,
      showingInfoWindow: true
    });
    console.log(this.state.markers);
  };
  // if the infowindow state is equal to true on close this changes it to false and marker is inactive
  onClose = props => {
    if (this.state.showingInfoWindow) {
      this.setState({
        showingInfoWindow: false,
        activeMarker: null
      });
    }
  };

  displayMarkers = () => {
    //map through array looks at each index
    return this.state.markers.map((marker, index) => {
      //return each position from that ref point
      console.log(
        `Location: ${marker.placeName} Description: ${marker.placeInfo}`
      );
      return (
        <Marker
          key={index}
          id={index}
          position={{
            lat: marker.latitude,
            lng: marker.longitude
          }}
          //add some functionality to prop being passed in
          onClick={this.onMarkerClick}
          name={marker.placeName}
          info={`Description: ${marker.placeInfo}`}
          lat={`Latitude: ${marker.latitude}`}
          long={`Longitude: ${marker.longitude}`}
        />
      );
    });
  };

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    const pinsRef = firebase.database().ref("pins");
    const pin = {
      latsValue: this.state.lats,
      longsValue: this.state.longs,
      infoValue: this.state.info,
      nameValue: this.state.name
    };
    pinsRef.push(pin);
    this.setState({
      lats: "",
      longs: "",
      info: "",
      name: ""
    });
  };

  render() {
    return (
      <div>
        <section styles={formStyles} className="add-pin">
          <form className="FormMove" onSubmit={this.handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Name of Location"
              onChange={this.handleChange}
              value={this.state.name}
              required
            />
            <input
              type="text"
              name="info"
              placeholder="Information on tick location"
              onChange={this.handleChange}
              value={this.state.info}
              required
            />
            <input
              type="text"
              name="lats"
              placeholder="Enter lats"
              onChange={this.handleChange}
              value={this.state.lats}
              required
            />
            <input
              type="text"
              name="longs"
              placeholder="Enter longs"
              onChange={this.handleChange}
              value={this.state.longs}
              required
            />
            <button>Add Pin</button>
          </form>
        </section>
        <Map
          google={this.props.google}
          zoom={10}
          style={mapStyles}
          initialCenter={{ lat: 45.52, lng: -122.01 }}
          zoomControl={true}
          onClick={e => this.handleClick(e)}
          onDoubleClick={this.handleRightClick}
        >
          {this.displayMarkers()}
          <InfoWindow
            marker={this.state.activeMarker}
            visible={this.state.showingInfoWindow}
            onClose={this.onClose}
            maxWidth={300}
          >
            <div>
              <h4>{this.state.selectedPlace.name}</h4>
              <h6>{this.state.selectedPlace.info}</h6>
              <h6>
                {this.state.selectedPlace.lat}, {this.state.selectedPlace.long}
              </h6>
            </div>
          </InfoWindow>
        </Map>
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: "AIzaSyCi0237UFPbZVMuAUSls22QBuk7XTce9ko"
})(MapContainer);
