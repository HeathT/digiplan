<cfapplication name="digiplan" 
			   loginstorage="session" 
               clientmanagement="yes" 
               clientstorage="registry" 
               sessionmanagement="yes" 
               sessiontimeout="#CreateTimeSpan(0,4,0,0)#">


<cfset application.httpProxy = cgi.server_name>

<cfset application.userFilesPath="http://#application.httpProxy#/digiplan/resources/">

<cfparam name="application.cfcPath" default="participate.model"> 	<!--- path to cfc directory --->
<cfset application.root="http://#application.httpProxy#/digiplan/"> 		<!--- used to provide the root path --->
<cfset application.ds="digiplandata">

<cfset application.debugging = true>