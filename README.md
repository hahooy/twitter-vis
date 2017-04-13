# twitter

## How to access the site

Because GitHub pages require HTTPS but our backend server doesn't have a CA certificate, the site hosted on GitHub pages won't be able to query data from the server. Therefore we host our website entirely on AWS instead. The link to the website is [http://ec2-54-91-157-7.compute-1.amazonaws.com:8999](http://ec2-54-91-157-7.compute-1.amazonaws.com:8999)



## What is in the repo

 * /server has all the backend code, implemented in Django and Python
 * /website has all the client code, visualizations are all implemented using D3.js