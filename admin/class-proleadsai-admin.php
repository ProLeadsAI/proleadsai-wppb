<?php

/**
 * The admin-specific functionality of the plugin.
 *
 * @link       https://proleadsai.com
 * @since      1.0.0
 *
 * @package    Proleadsai
 * @subpackage Proleadsai/admin
 */

/**
 * The admin-specific functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the admin-specific stylesheet and JavaScript.
 *
 * @package    Proleadsai
 * @subpackage Proleadsai/admin
 * @author     ProleadsAI <jo@proleadsai.com>
 */
class Proleadsai_Admin {

	/**
	 * The ID of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $plugin_name    The ID of this plugin.
	 */
	private $plugin_name;

	/**
	 * The version of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $version    The current version of this plugin.
	 */
	private $version;

	/**
	 * Initialize the class and set its properties.
	 *
	 * @since    1.0.0
	 * @param      string    $plugin_name       The name of this plugin.
	 * @param      string    $version    The version of this plugin.
	 */
	public function __construct( $plugin_name, $version ) {

		$this->plugin_name = $plugin_name;
		$this->version = $version;

	}

	/**
	 * Register the stylesheets for the admin area.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_styles() {
		// Use file modification time for cache busting
		$css_file = plugin_dir_path( __FILE__ ) . 'dist/proleadsai-admin.css';
		$css_version = file_exists($css_file) ? filemtime($css_file) : $this->version;
		wp_enqueue_style( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'dist/proleadsai-admin.css', array(), $css_version, 'all' );
	}

	/**
	 * Register the JavaScript for the admin area.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_scripts() {

		// Enqueue WordPress media library for image uploads
		wp_enqueue_media();

		// Enqueue the Vue app - use file modification time for cache busting
		$js_file = plugin_dir_path( __FILE__ ) . 'dist/proleadsai-admin.js';
		$js_version = file_exists($js_file) ? filemtime($js_file) : $this->version;
		wp_enqueue_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'dist/proleadsai-admin.js', array(), $js_version, true );
		
		// Determine current page
		$screen = get_current_screen();
		$page = 'onboarding';
		if ( $screen && strpos( $screen->id, 'proleadsai-dashboard' ) !== false ) {
			$page = 'dashboard';
		} elseif ( $screen && strpos( $screen->id, 'proleadsai-settings' ) !== false ) {
			$page = 'settings';
		}
		
		// Pass data to JS
		wp_localize_script( $this->plugin_name, 'proleadsaiSettings', array(
			'baseUrl' => function_exists('proleadsai_get_base_url') ? proleadsai_get_base_url() : 'https://app.proleadsai.com',
			'apiUrl' => function_exists('proleadsai_get_api_url') ? proleadsai_get_api_url() : 'https://app.proleadsai.com/api',
			'version' => $this->version,
			'nonce' => wp_create_nonce( 'wp_rest' ),
			'adminAjax' => admin_url( 'admin-ajax.php' ),
			'adminUrl' => admin_url(),
			'siteUrl' => get_site_url(),
			'page' => $page
		));

	}

	/**
	 * Add type="module" to the script tag
	 */
	public function add_module_type_attribute( $tag, $handle, $src ) {
		if ( $this->plugin_name !== $handle ) {
			return $tag;
		}
		
		// Simply add type="module" to the existing script tag
		return str_replace( "<script", '<script type="module"', $tag );
	}

	/**
	 * Register the admin menu for the plugin.
	 */
	public function add_admin_menu() {
		// Check if onboarding is completed
		$onboarding = get_option( 'proleadsai_onboarding', array() );
		$is_completed = ! empty( $onboarding['completed'] );
		
		// Main menu - Dashboard if completed, Onboarding if not
		if ( $is_completed ) {
			add_menu_page(
				'ProLeadsAI Dashboard', 
				'ProLeadsAI', 
				'manage_options', 
				'proleadsai-dashboard', 
				array( $this, 'display_page' ), 
				'dashicons-admin-home', 
				6
			);
			
			// Submenu pages
			add_submenu_page(
				'proleadsai-dashboard',
				'Dashboard',
				'Dashboard',
				'manage_options',
				'proleadsai-dashboard',
				array( $this, 'display_page' )
			);
			
			add_submenu_page(
				'proleadsai-dashboard',
				'Settings',
				'Settings',
				'manage_options',
				'proleadsai-settings',
				array( $this, 'display_page' )
			);
		} else {
			add_menu_page(
				'ProLeadsAI Setup', 
				'ProLeadsAI', 
				'manage_options', 
				'proleadsai-onboarding', 
				array( $this, 'display_page' ), 
				'dashicons-admin-home', 
				6
			);
		}
	}

	/**
	 * Display the page content.
	 */
	public function display_page() {
		?>
		<div class="wrap">
			<div id="proleadsai-app"></div>
		</div>
		<?php
	}

}
