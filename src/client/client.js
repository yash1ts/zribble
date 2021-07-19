import axios from 'axios';

export default class Client {
  baseUrl = 'https://burppbackend.herokuapp.com/api/';

  doFetch = async (method, url, data = {}) => {
    console.log(`Client: fetching [${method}] route ${this.baseUrl + url}`);
    try {
      const response = await axios({method, url: this.baseUrl + url, data});
      // console.log(response.data);
      return response.data;
    } catch (error) {
      // console.log(error.response.data);
      return error.response?.data || {error};
    }
  };

  
}
