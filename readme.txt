=== ProLeadsAI ===
Contributors: tzitzi
Tags: roofing, lead generation, roof estimate, iframe
Requires at least: 5.0
Tested up to: 6.9
Stable tag: 1.0.0
Requires PHP: 7.4
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
Language: en_US

Add an instant roof estimate widget to your WordPress site. Visitors enter their address and get roof size, cost estimates, and pitch information.

== Description ==

ProLeadsAI adds a powerful roof estimation tool to your WordPress site. When visitors enter their address, they instantly see:

= External Services =

This plugin connects to the following external services:

**ProLeadsAI API** (https://app.proleadsai.com)

* Used for: User authentication, lead management, roof estimation data processing, and dashboard analytics
* Data sent: Address searches, lead contact information (name, email, phone), roof estimation requests
* When: During plugin setup, when visitors use the roof estimator, and when leads submit contact forms
* Terms of Service: https://proleadsai.com/terms
* Privacy Policy: https://proleadsai.com/privacy

**ProLeadsAI CDN** (https://cdn.proleadsai.com)

* Used for: Default widget images and icons (house image, location icons)
* Data sent: None (static image assets only)
* When: When the widget loads and displays default images
* Terms of Service: https://proleadsai.com/terms
* Privacy Policy: https://proleadsai.com/privacy

By installing and activating this plugin, you agree to the terms of service of these external services.

**Note:** This plugin integrates with external services and requires account connection to enable estimation features. The plugin installs and activates without this configuration and does not transmit any data until onboarding is completed.

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

== Installation ==

1. Upload the `proleadsai` folder to `/wp-content/plugins/`
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Go to ProLeadsAI in the admin menu to complete setup
4. Create or connect your ProLeadsAI account
5. Configure your price per square foot and appearance settings

= Shortcode Usage =

Embed the widget anywhere using:

`[proleadsai_widget]`

Or with custom options:

`[proleadsai_widget position="bottom-right" display="true"]`

== Frequently Asked Questions ==

= Do I need my own Google Maps or Solar API key? =

No. The WordPress plugin now uses the hosted ProLeadsAI iframe widget, so Google Maps and Solar API keys are handled by the ProLeadsAI application layer rather than configured in WordPress.

= How accurate are the roof estimates? =

Estimates are based on Google's satellite imagery data. They provide a good starting point but actual costs may vary based on roof complexity, materials chosen, and local labor rates.

= Can I customize the widget appearance? =

Yes! You can set primary and secondary colors, button position, and whether to show the floating button or use shortcode placement only.

== Screenshots ==

1. Floating widget button on a live site
2. Slide-out panel that opens when clicking the floating widget
3. Address search inside the hosted ProLeadsAI iframe
4. Roof estimate results with satellite map, square footage, and cost estimate
5. Confirmation view after a lead submits the contact form
6. WordPress admin dashboard
7. Floating button appearance and position settings
8. Shortcode settings to embed the widget anywhere on your site

== Source Code ==

This plugin uses build tools to generate optimized JavaScript and CSS files. The complete source code is publicly available:

**Main Plugin Repository**: https://github.com/ProLeadsAI/proleadsai-wppb
- WordPress plugin files, PHP backend, admin interface
- Admin assets built with Vite.js from `/admin/src/` directory

**Custom Widget Element**: https://github.com/ProLeadsAI/proleadsai-custom-element
- Standalone Vue.js widget and hosted iframe for the roof estimator experience
- Can be used on any website, not just WordPress

**Build Process**:
- Main plugin: Run `pnpm build` to generate admin assets
- Hosted widget repo: Run `pnpm build` in the custom element directory to publish the hosted iframe/widget assets
- Full release: Run `pnpm release` to create complete plugin package

All source code is available for review, study, and contribution in accordance with open source principles.

== Changelog ==

= 1.0.0 =
* Initial release
* Instant roof estimates from address input
* Google Places autocomplete for address search
* Interactive satellite roof map with outline overlay
* Roof area, cost estimate, and pitch analysis
* Lead capture contact form
* Floating button widget with customizable position and colors
* Shortcode embed for placing the widget anywhere on your site
* WordPress admin dashboard for business and appearance settings
* Hosted iframe integration for public widget rendering

== Upgrade Notice ==

= 1.0.0 =
Initial release.

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

* Visitor data (searches and leads) is stored on ProLeadsAI servers (https://app.proleadsai.com)
* Data is associated with your organization account and accessible via your dashboard
* No visitor data is stored in the WordPress database

= Data Sharing =

* Address data is sent to ProLeadsAI services for geocoding and roof analysis
* No data is sold or shared with third parties for marketing purposes

= User Rights =

* Site visitors can request deletion of their data by contacting the site owner
* Site owners can delete leads from their ProLeadsAI dashboard
* Account deletion requests can be made at https://proleadsai.com/contact

For the full privacy policy, visit: https://proleadsai.com/privacy
