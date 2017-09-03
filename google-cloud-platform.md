# Google Cloud Platform

I've got experience running applications on AWS on EC2 (with autoscaling), Elastic Beanstalk and Lambda using DyanmoDB as a key-value, pseudo-document store.  I've done the Heroku tutorials.  I also have some experience with Google App Engine, specifically the original Python platform.  Rather than sticking with my go-to (AWS), this may be a good project to launch in Google Cloud Platform.

## Conclusion

Because I like the easy App Engine deployment and websockets are not an essential feature, I added the option to disable websockets.

## Analysis

The expanded Google Cloud Platform has a Google App Engine Flexible Environment (https://cloud.google.com/appengine/docs/flexible/).  At first glance, it looks somewhat like Heroku, but seems to be based on VMs or Docker.  However, websockets are not supported by the App Engine flexible environment (https://cloud.google.com/appengine/docs/flexible/nodejs/how-requests-are-handled).  An example that supposedly did websockets (https://github.com/GoogleCloudPlatform/nodejs-docs-samples/tree/master/appengine/websockets) has vanished.  Google uses dedicated GCE resources in a gaming demo that uses websockets: https://cloud.google.com/solutions/real-time-gaming-with-node-js-websocket.  One contradiction is https://github.com/GoogleCloudPlatform/appengine-websocketchat-java.  Anyway, the load balancer supports websockets (https://cloud.google.com/compute/docs/load-balancing/http/#websocket_proxy_support), so App Engine support should eventually follow.

AWS supports websockets in Elastic Beanstalk (cf. https://aws.amazon.com/blogs/database/how-to-build-a-chat-application-with-amazon-elasticache-for-redis/).  It can do so because the ELB Application Load Balancer supports websockets.  Sticky sessions must be enabled in the load balancer.  The Elastic Beanstalk nginx proxy also needs special configuration for websockets.  Note that the use of nginx as a reverse proxy may limit the number of websocket connections per server (as might the use of ELB) since each websocket client will seem to come from a single IP, each connection is identified by (IP, port), and there are 64k ports.

AWS IoT Gateway supports MQTT over websockets.  But of course we are not doing IoT (e.g. no device shadow).  But there is an example of using IoT Gateway with API Gateway and Lambda: https://serverless.com/blog/serverless-notifications-on-aws/.
