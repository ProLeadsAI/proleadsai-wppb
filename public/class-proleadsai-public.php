<?php

/**
 * The public-facing functionality of the plugin.
 *
 * @link       https://proleadsai.com
 * @since      1.0.0
 *
 * @package    Proleadsai
 * @subpackage Proleadsai/public
 */

/**
 * The public-facing functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the public-facing stylesheet and JavaScript.
 *
 * @package    Proleadsai
 * @subpackage Proleadsai/public
 * @author     ProleadsAI <jo@proleadsai.com>
 */
class Proleadsai_Public {

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
	 * @param      string    $plugin_name       The name of the plugin.
	 * @param      string    $version    The version of this plugin.
	 */
	public function __construct( $plugin_name, $version ) {

		$this->plugin_name = $plugin_name;
		$this->version = $version;

	}

	/**
	 * Register the stylesheets for the public-facing side of the site.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_styles() {
		wp_enqueue_style( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'css/proleadsai-public.css', array(), $this->version, 'all' );
	}

	/**
	 * Register the JavaScript for the public-facing side of the site.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_scripts() {
		// Get onboarding settings
		$settings = get_option( 'proleadsai_onboarding', array() );
		
		// Check if widget should be shown
		$show_widget = isset( $settings['show_widget'] ) ? $settings['show_widget'] : true;
		$completed = ! empty( $settings['completed'] );
		
		if ( ! $show_widget || ! $completed ) {
			return;
		}
		
		// Widget CSS
		wp_enqueue_style(
			$this->plugin_name . '-widget-css',
			plugin_dir_url( __FILE__ ) . 'css/proleadsai-widget.css',
			array(),
			$this->version
		);
		
		// Use Vue custom element widget
		wp_enqueue_script( 
			$this->plugin_name . '-widget-ce', 
			plugin_dir_url( __FILE__ ) . 'js/proleadsai-widget-ce.js', 
			array(), 
			$this->version, 
			true 
		);
		
		// Widget launcher script
		wp_enqueue_script( 
			$this->plugin_name . '-widget-launcher', 
			plugin_dir_url( __FILE__ ) . 'js/proleadsai-widget-launcher.js', 
			array( $this->plugin_name . '-widget-ce' ), 
			$this->version, 
			true 
		);
		
		// Pass settings to JS
		wp_localize_script( $this->plugin_name . '-widget-launcher', 'proleadsaiWidget', array(
			'apiUrl' => 'https://next.proleadsai.com/api',
			'orgId' => $settings['team_id'] ?? '',
			'googleMapsApiKey' => $settings['google_maps_api_key'] ?? '',
			'primaryColor' => $settings['primary_color'] ?? '#1d4ed8',
			'secondaryColor' => $settings['secondary_color'] ?? '#22c55e',
			'buttonPosition' => $settings['button_position'] ?? 'bottom-center',
			'businessName' => $settings['business'] ?? ''
		));
	}

	/**
	 * Render the floating widget button in the footer
	 */
	public function render_widget() {
		$settings = get_option( 'proleadsai_onboarding', array() );
		
		$show_widget = isset( $settings['show_widget'] ) ? $settings['show_widget'] : true;
		$completed = ! empty( $settings['completed'] );
		
		if ( ! $show_widget || ! $completed ) {
			return;
		}
		
		$position = $settings['button_position'] ?? 'bottom-center';
		$primary_color = $settings['primary_color'] ?? '#1d4ed8';
		$business_name = $settings['business'] ?? 'Get Estimate';
		
		// Position classes
		$position_styles = array(
			'bottom-left' => 'left: 20px; right: auto;',
			'bottom-center' => 'left: 50%; transform: translateX(-50%);',
			'bottom-right' => 'right: 20px; left: auto;',
			'left-edge' => 'left: 0; bottom: 50%; transform: translateY(50%) rotate(-90deg); transform-origin: left bottom;',
			'right-edge' => 'right: 0; bottom: 50%; transform: translateY(50%) rotate(90deg); transform-origin: right bottom;'
		);
		
		$pos_style = $position_styles[$position] ?? $position_styles['bottom-center'];
		?>
		<div id="proleadsai-widget-container">
			<button 
				id="proleadsai-widget-button"
				style="
					position: fixed;
					bottom: 20px;
					<?php echo $pos_style; ?>
					background-color: <?php echo esc_attr( $primary_color ); ?>;
					color: white;
					border: none;
					padding: 12px 24px;
					border-radius: 50px;
					font-size: 16px;
					font-weight: 600;
					cursor: pointer;
					box-shadow: 0 4px 12px rgba(0,0,0,0.15);
					z-index: 9999;
					display: flex;
					align-items: center;
					gap: 8px;
					transition: transform 0.2s, box-shadow 0.2s;
				"
				onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 6px 16px rgba(0,0,0,0.2)';"
				onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';"
			>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
					<polyline points="9 22 9 12 15 12 15 22"></polyline>
				</svg>
				Get Roof Estimate
			</button>
			
			<!-- Modal will be injected here by JS -->
			<div id="proleadsai-modal" style="display: none;"></div>
		</div>
		<?php
	}

}
