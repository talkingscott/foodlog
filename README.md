# foodlog

A primitive web app to log food consumption.

The app is under development.  The plumbing is generally in place, but there are some essential TODO items:

* Implement a data store for a managed cloud database, like DynamoDB or Cloud Datastore/Bigtable/Spanner.
* Implement a server initiated websocket heartbeat to teardown phantom connections.
* Implement client websocket reconnect loop: the current code tries to reconnect only once.

Other desirables are:

* Delete an item from the list (but not infinitely in the past).
* Typeahead recommendations for food based on existing foods.
* Database of food nutrition information.
* Reports of nutrition per day.
* Even fancier stuff I would never use, like a pretty dashboard.
* Multi-tenancy.
* Nicer appearance on a laptop browser.

## Dates and times

"Natural" specification is supported.  "Now", "today" and "yesterday" specify an "anchor".  A time can be specified as well.  For "today" or "yesterday", it is the time of day.  The time can be just hours or hours and minutes.  The hours and minutes are not validated other than to ensure they are numeric.  Note that for the anchor of "now", the time must be negative: it represents the amount of time prior to now.  When no anchor is specified, "now" is inferred if the time is negative, otherwise "today" is used.

The entered date and time are treated as local time.
