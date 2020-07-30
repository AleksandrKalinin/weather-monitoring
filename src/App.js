import React, { Component, Fragment } from 'react';
import {Input,Button,Card,Grid} from 'semantic-ui-react';
import axios from 'axios';
class App extends Component {

  constructor(props){
    super(props);
    this.state = {
      API_KEY: "a5821f4600801be4a4ebefc0a0a643ba",
      weather: [],
      search: '',
      latitude: null,
      longitude: null,
      isVisible: false,
      isFetching: false,
      isFailed: false,
      timestrSunset: null,
      timestrSunrise: null,
      iconCode: null,
      iconUrl: null,
      forecast: [],
      time: [],
      currentBackground: ''
    }
  }

  componentDidMount() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
        this.setState({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
       })
  		const lat = this.state.latitude;
  		const long = this.state.longitude;
  		const ROOT_URL = `https://api.openweathermap.org/data/2.5/weather?appid=${this.state.API_KEY}`;
  		const ROOT_URL2= `https://api.openweathermap.org/data/2.5/forecast?appid=${this.state.API_KEY}`;
  		const url = `${ROOT_URL}&lat=${lat}&lon=${long}&units=metric`;
  		const url2 =`${ROOT_URL2}&lat=${lat}&lon=${long}&units=metric`;
      axios.all([axios.get(url), axios.get(url2)])
           .then(axios.spread((firstResponse, secondResponse) => { 
      				const weather = firstResponse.data;
      				const forecast = secondResponse.data; 
      				this.setState({
      					weather: weather,
      					forecast: forecast
      				}, () => this.defaultWeather())
           }))         
        });
      } else {
        alert("Geolocation is not supported by this browser.");
      }
    }

    updateSearch = (e) =>{
      this.setState({
        search: e.target.value
      })
    }

    defaultWeather = () =>{
     let params = this.fetchData();
      this.setState({
        isVisible: true,
        timestrSunrise: params.timestrSunrise,
        timestrSunset: params.timestrSunset,
        iconCode: params.iconCode,
        iconUrl: params.iconUrl,
        time: params.forecast,
        forecast: params.newForecast
      }) 
    }

    fetchData = () =>{
      var iconCode = this.state.weather.weather[0].icon;
      var iconUrl = "https://openweathermap.org/img/w/" + iconCode + ".png";      
      var sunrise = this.state.weather.sys.sunrise;
      var sunset = this.state.weather.sys.sunset;
      var dateSunrise = new Date(sunrise * 1000);
      var timestrSunrise = dateSunrise.toLocaleTimeString();
      var dateSunset = new Date(sunset * 1000);
      var timestrSunset = dateSunset.toLocaleTimeString();
      var forecast = this.state.forecast.list.slice();
      var newForecast = [];
      var newObj = {};
      forecast.map((item,index) =>{
          var date = new Date(item.dt * 1000);
          var hours = date.getHours();
          var minutes = "0" + date.getMinutes();
          var seconds = "0" + date.getSeconds();
          var week = ["Sunday","Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          var day = date.getDate();
          var weekday = week[date.getDay()];
          var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);          
          item.dt = formattedTime;
          item.weekday = weekday;
          item.day = day;
      }) 
      for (var i = 0; i < forecast.length; i+=8) {
          let iconCode = forecast[i].weather[0].icon;
          let iconUrl = "https://openweathermap.org/img/w/" + iconCode + ".png";  
          newObj["formattedTime"] = forecast[i].dt;
          newObj["weekday"] = forecast[i].weekday;
          newObj["day"] = forecast[i].day;
          newObj["temp"] = forecast[i].main.temp;
          newObj["max"] = forecast[i].main.temp_max;
          newObj["min"] = forecast[i].main.temp_min;
          newObj["currentName"] = forecast[i].weather[0].main;
          newObj["currentDescription"] = forecast[i].weather[0].description;
          newObj["icon"] = iconUrl;
          newObj["wind"] = forecast[i].wind.speed;
          newForecast.push(newObj);
          newObj = {};
      }
      let condition = this.state.weather.weather[0].main;
      console.log(condition);
      let element = document.getElementById('root-wrapper')
      if (condition == "Clouds") {
        this.setState({ currentBackground: 'cloudy.jpg' })
      }
      else if (condition == "Rain" || condition == "Drizzle") {
        this.setState({ currentBackground: 'rainy.jpg' })
      }
      else if(condition == "Snow") {
        this.setState({ currentBackground: 'snowy.jpg' })
      }
      else if (condition == "Mist") {
        this.setState({ currentBackground: 'misty.jpg' })
      }      
      else{
        this.setState({ currentBackground: 'sunny.jpg' })
      }
      return ({
      	timestrSunrise: timestrSunrise,
      	timestrSunset: timestrSunset,
      	iconCode: iconCode,
      	iconUrl: iconUrl,
      	forecast: forecast,
      	newForecast: newForecast
      });
    }

	fetchInputData = () =>{
		this.setState({
			isVisible: false,
			isFetching: true
		})
		const city = this.state.search;
		const ROOT_URL = `https://api.openweathermap.org/data/2.5/weather?appid=${this.state.API_KEY}`;
		const ROOT_URL2= `https://api.openweathermap.org/data/2.5/forecast?appid=${this.state.API_KEY}`;
		const url = `${ROOT_URL}&q=${city}&units=metric`;
		const url2 =`${ROOT_URL2}&q=${city}&units=metric`;
		axios.all([axios.get(url), axios.get(url2)])
		     .then(axios.spread((firstResponse, secondResponse) => { 
				this.setState({
					weather: firstResponse.data,
					forecast: secondResponse.data
				}, () => this.fetchForecast())
		     }))
			.catch((error) => {
			      this.setState({isFailed: true, isFetching: false, isVisible: false});
			  });
    }

    fetchForecast = () =>{
     let params = this.fetchData();
     console.log(params);
      this.setState({
        isVisible: true,
        isFailed: false,
        isFetching: false,
        timestrSunrise: params.timestrSunrise,
        timestrSunset: params.timestrSunset,
        iconCode: params.iconCode,
        iconUrl: params.iconUrl,
        time: params.forecast,
        forecast: params.newForecast,
        search: ''
      })            
    }

	handleKeyPress = (target) => {
	  if(target.charCode === 13){
	    this.fetchInputData();
	    this.setState({
	    	search: ''
	    })    
	  } 
	}

  render() {

    return (
      <Fragment>
        <div id="root-image">
          <img src={this.state.currentBackground} />
        </div>
        <div id="root-wrapper">
          <div className="input-wrapper">
            <Input value={this.state.search} placeholder="search for city" onKeyPress={this.handleKeyPress} className="main-input" onChange={this.updateSearch} ></Input> 
            <Button onClick={this.fetchInputData} primary >Search</Button>
          </div>
  	     {this.state.isVisible ?
          <Fragment>	     	
            <Grid divided className="weather-wrapper">
              <Grid.Row columns={2} className="top-row" >
                <Grid.Column className="column-header">
                  <h1>{this.state.weather.main.temp}° </h1>
                </Grid.Column>
                <Grid.Column className="column-header">
                  <h2>{this.state.weather.name}, {this.state.weather.sys.country}</h2>
                </Grid.Column>
              </Grid.Row>          
              <Grid.Row columns={4} className="weather-row">
                <Grid.Column className="weather-column" >
                  <h4 className="weather-header">{this.state.weather.main.temp_min}° / {this.state.weather.main.temp_max}° </h4>
                  <p className="weather-descr">High / Low</p>
                </Grid.Column>
                <Grid.Column className="weather-column">
                  <h4 className="weather-header">{this.state.weather.main.temp}° </h4>
                  <p className="weather-descr">Feels like</p>
                </Grid.Column>
                <Grid.Column className="weather-column">
                  <h4 className="weather-header">{this.state.timestrSunrise}</h4>
                  <p className="weather-descr">Sunrise</p>
                </Grid.Column>
                <Grid.Column className="weather-column">
                  <h4 className="weather-header">{this.state.timestrSunset}</h4>
                  <p className="weather-descr">Sunset</p>
                </Grid.Column>              
              </Grid.Row>
              <Grid.Row columns={4} className="weather-row">
                <Grid.Column className="weather-column">
                  <h4 className="weather-header">{this.state.weather.weather[0].main} <img src={this.state.iconUrl}/></h4>
                  <p className="weather-descr">Current condition</p>
                </Grid.Column>            
                <Grid.Column className="weather-column">
                  <h4 className="weather-header">{this.state.weather.main.pressure} hpa</h4>
                  <p className="weather-descr">Pressure</p>
                </Grid.Column>
                <Grid.Column className="weather-column">
                  <h4 className="weather-header">{this.state.weather.main.humidity}</h4>
                  <p className="weather-descr">Humidity</p>
                </Grid.Column>
                <Grid.Column className="weather-column">
                  <h4 className="weather-header">{this.state.weather.wind.speed} m/s</h4>
                  <p className="weather-descr">Wind</p>
                </Grid.Column>
              </Grid.Row>
              <Grid.Row columns={1}>
                <Grid.Column>
                  <p className="weather-descr">Today: {new Date().toLocaleDateString()}</p>
                </Grid.Column>
              </Grid.Row>            
            </Grid>
            <Card.Group itemsPerRow={5} className="forecast-wrapper">
              {this.state.forecast.map((item,index) =>
                <Card key={index}>
                  <Card.Content className="header-wrapper">
                    <Card.Header>{item.weekday}, {item.day} </Card.Header>                
                  </Card.Content>
                  <Card.Content className="icon-wrapper">
                    <img src={item.icon} />
                  </Card.Content>
                  <Card.Content className="icon-description">
                      <h4>{item.max} / {item.min}</h4>
                      <p>{item.currentName} ({item.currentDescription})</p>
                      <p>Wind speed: {item.wind} m/s</p>
                  </Card.Content>
                </Card>
              )}
            </Card.Group>
  	     </Fragment> : 
            null
  	    }
  	     { this.state.isFetching ?
            <Grid divided className="weather-wrapper fetching-wrapper">
            		Fetching...
            </Grid>
            : null}
  	     { this.state.isFailed ?
            <Grid divided className="weather-wrapper fetching-wrapper">
            		Sorry, the request failed. Try one more time
            </Grid>
            : null}          	    
        </div>
      </Fragment>
    );
  }
}

export default App;
