# foodlog

A primitive web app to log food consumption.

The app is under development.  The plumbing is generally in place, but there are some essential TODO items:

* Decide how to represent dates and times and apply appropriate validation.
* Implement data store callbacks, rather than synchronous calls.  Maybe use a promise library?
* Implement a real data store.  The current one just keeps a list in memory.  Maybe do leveldb then either DynamoDB or Cloud Datastore.
* Implement a server initiated web socket heartbeat to teardown phantom connections.
* Implement client web socket reconnect.

Other desirables are:

* Deleted item from list (but not infinitely in the past)
* Typeahead recommendations for food based on existing foods.
* Database of food nutrition information.
* Reports of nutritions per day.
* Fancy stuff I would never use.

## Dates and times

ISO formats are accepted: yyyy-MM-dd and HH:mm.  Localized formats are not.  However, "natural" specification must be supported.  "Today" and "yesterday" must be OK for the date.  "Now" should be accepted for times.  A simple number giving the hours (military time) should be OK, as should a number with a negative sign, indicating that many hours ago.  So, for example, a date of "Now" and a time of "-1" should mean "an hour ago".

Date and time should be entered as local time.  The client app should do conversion to/from UTC when communicating with the server.  The server should always handle UTC.
