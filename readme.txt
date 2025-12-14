=== ProLeadsAI - Instant Roof Estimates ===
Contributors: proleadsai
Donate link: https://proleadsai.com/
Tags: roofing, lead generation, roof estimate, google maps
Requires at least: 5.0
Tested up to: 6.7
Stable tag: 1.0.2
Requires PHP: 7.4
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Add an instant roof estimate widget to your WordPress site. Visitors enter their address and get roof size, cost estimates, and pitch information.

== Description ==

ProLeadsAI adds a powerful roof estimation tool to your WordPress site. When visitors enter their address, they instantly see:

= External Services =

This plugin connects to the following external services:

**ProLeadsAI API** (https://next.proleadsai.com)

* Used for: User authentication, lead management, roof estimation data processing, and dashboard analytics
* Data sent: Address searches, lead contact information (name, email, phone), roof estimation requests
* When: During plugin setup, when visitors use the roof estimator, and when leads submit contact forms
* Terms of Service: https://proleadsai.com/terms
* Privacy Policy: https://proleadsai.com/privacy

**Google Maps Platform APIs**

* Used for: Address autocomplete, geocoding, satellite imagery for roof analysis, and Solar API for roof measurements
* Data sent: Address queries, geographic coordinates
* When: When visitors search for an address or view roof estimates
* Terms of Service: https://cloud.google.com/maps-platform/terms
* Privacy Policy: https://policies.google.com/privacy

By installing and activating this plugin, you agree to the terms of service of these external services.

* **Roof Area** - Total square footage calculated from satellite imagery
* **Cost Estimate** - Based on your configured price per square
* **Roof Pitch** - Steepness classification (Flat, Low, Medium, Steep)
* **Interactive Map** - Visual roof outline overlay

The widget captures leads when visitors request a detailed quote, sending their contact info directly to your ProLeadsAI dashboard.

= Features =

* Floating button or shortcode embed options
* Customizable colors to match your brand
* Mobile-responsive design
* Lead capture with contact form
* Integration with ProLeadsAI dashboard for lead management

= Requirements =

* ProLeadsAI account (free to create at proleadsai.com)
* Google Maps API key with the following APIs enabled:
  * Maps JavaScript API
  * Places API
  * Geocoding API
  * Solar API

== Installation ==

1. Upload the `proleadsai` folder to `/wp-content/plugins/`
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Go to ProLeadsAI in the admin menu to complete setup
4. Create or connect your ProLeadsAI account
5. Add your Google Maps API key (see FAQ for setup instructions)
6. Configure your price per square foot and appearance settings

= Shortcode Usage =

Embed the widget anywhere using:

`[proleadsai_widget]`

Or with custom options:

`[proleadsai_widget position="bottom-right" display="true"]`

== Frequently Asked Questions ==

= How do I get a Google Maps API key? =

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select an existing one
3. Enable these APIs: Maps JavaScript API, Places API, Geocoding API, Solar API
4. Go to Credentials > Create Credentials > API Key
5. Configure HTTP referrer restrictions for your domain
6. Copy the key to your ProLeadsAI settings

= Why do I need my own Google API key? =

Each WordPress site uses its own Google API key so you can:
* Control your own API costs and usage limits
* Monitor usage in your Google Cloud Console
* Keep billing separate from the ProLeadsAI service

= How accurate are the roof estimates? =

Estimates are based on Google's satellite imagery data. They provide a good starting point but actual costs may vary based on roof complexity, materials chosen, and local labor rates.

= Can I customize the widget appearance? =

Yes! You can set primary and secondary colors, button position, and whether to show the floating button or use shortcode placement only.

== Screenshots ==

1. Roof estimate results with interactive map
2. Admin settings page
3. Floating widget button
4. Lead capture form

== Changelog ==

= 1.0.2 =
* Improved: Settings page now auto-validates API keys when changed
* Improved: Reset settings functionality
* Improved: Upgrade modal styling
* Fixed: Proper cleanup of plugin data on uninstall

= 1.0.1 =
* Fixed: Modal/slide-out shadow overlay now properly clears when closing
* Fixed: Backend now uses organization's Google Maps API key for Solar API calls
* Improved: Better error messages when API key is not configured

= 1.0.0 =
* Initial release
* Instant roof estimates from address input
* Google Places autocomplete for address search
* Interactive roof outline map
* Lead capture form
* Customizable appearance settings
* Floating button and shortcode options

== Upgrade Notice ==

= 1.0.1 =
Fixes overlay display issues and ensures your Google API key is used for all API calls.

== Privacy Policy ==

ProLeadsAI respects user privacy and is designed with privacy in mind.

= Data Collection =

**Site Visitors:**
* Address searches entered into the roof estimator widget
* Contact information (name, email, phone) when voluntarily submitted via the lead capture form
* No tracking cookies or analytics are used

**Site Administrators:**
* Email address used for ProLeadsAI account authentication
* Organization settings and preferences

= Data Storage =

* Visitor data (searches and leads) is stored on ProLeadsAI servers (https://next.proleadsai.com)
* Data is associated with your organization account and accessible via your dashboard
* No visitor data is stored in the WordPress database

= Data Sharing =

* Address data is sent to Google Maps APIs for geocoding and roof analysis
* No data is sold or shared with third parties for marketing purposes

= User Rights =

* Site visitors can request deletion of their data by contacting the site owner
* Site owners can delete leads from their ProLeadsAI dashboard
* Account deletion requests can be made at https://proleadsai.com/contact

For the full privacy policy, visit: https://proleadsai.com/privacy