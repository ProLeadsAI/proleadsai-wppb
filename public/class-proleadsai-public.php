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
		
		// Use Vue custom element widget (now includes floating button)
		wp_enqueue_script( 
			$this->plugin_name . '-widget-ce', 
			plugin_dir_url( __FILE__ ) . 'js/proleadsai-widget-ce.js', 
			array(), 
			$this->version, 
			true 
		);
	}

	/**
	 * Render the floating widget in the footer
	 */
	public function render_widget() {
		$settings = get_option( 'proleadsai_onboarding', array() );
		
		$show_widget = isset( $settings['show_widget'] ) ? $settings['show_widget'] : true;
		$completed = ! empty( $settings['completed'] );
		
		if ( ! $show_widget || ! $completed ) {
			return;
		}
		
		echo $this->get_widget_html( 'floating' );
	}

	/**
	 * Shortcode handler for [proleadsai_widget]
	 * 
	 * Supported attributes:
	 * - heading: Custom heading text
	 * - bg: Background style (none, light, dark, or a hex color like #f5f5f4)
	 * - image: Hero image URL, "none" to hide, or "default" for default image
	 */
	public function shortcode_widget( $atts ) {
		$settings = get_option( 'proleadsai_onboarding', array() );
		$completed = ! empty( $settings['completed'] );
		
		if ( ! $completed ) {
			return '<!-- ProLeadsAI: Setup not completed -->';
		}
		
		// Parse shortcode attributes with defaults from settings
		$atts = shortcode_atts( array(
			'heading' => $settings['shortcode_heading'] ?? '',
			'bg' => $settings['shortcode_bg_style'] ?? 'none',
			'image' => null, // null means use settings default
			'mt' => $settings['shortcode_margin_top'] ?? '',
			'mb' => $settings['shortcode_margin_bottom'] ?? '',
		), $atts, 'proleadsai_widget' );
		
		// Enqueue scripts/styles for shortcode usage
		$this->enqueue_shortcode_assets();
		
		// Determine background style and color
		$bg_style = 'none';
		$bg_color = '#f5f5f4';
		
		if ( in_array( $atts['bg'], array( 'none', 'light', 'dark' ), true ) ) {
			$bg_style = $atts['bg'];
		} elseif ( preg_match( '/^#[0-9A-Fa-f]{3,6}$/', $atts['bg'] ) ) {
			// It's a hex color
			$bg_style = 'custom';
			$bg_color = $atts['bg'];
		} elseif ( $atts['bg'] === 'custom' ) {
			$bg_style = 'custom';
			$bg_color = $settings['shortcode_bg_color'] ?? '#f5f5f4';
		}
		
		// Determine hero image
		$hero_image = '';
		if ( $atts['image'] === null ) {
			// Use settings default
			$image_setting = $settings['shortcode_image'] ?? 'default';
			$custom_image = $settings['shortcode_custom_image'] ?? '';
			
			if ( $image_setting === 'none' ) {
				$hero_image = 'none';
			} elseif ( $image_setting === 'custom' && ! empty( $custom_image ) ) {
				$hero_image = $custom_image;
			}
		} elseif ( $atts['image'] === 'none' ) {
			$hero_image = 'none';
		} elseif ( $atts['image'] === 'default' ) {
			$hero_image = ''; // Uses widget default
		} else {
			// Custom URL provided in shortcode
			$hero_image = $atts['image'];
		}
		
		return $this->get_widget_html( 'inline', array(
			'heading' => $atts['heading'],
			'bg_style' => $bg_style,
			'bg_color' => $bg_color,
			'hero_image' => $hero_image,
			'margin_top' => $atts['mt'],
			'margin_bottom' => $atts['mb'],
		) );
	}

	/**
	 * Enqueue assets when shortcode is used
	 */
	private function enqueue_shortcode_assets() {
		// Widget CSS
		wp_enqueue_style(
			$this->plugin_name . '-widget-css',
			plugin_dir_url( __FILE__ ) . 'css/proleadsai-widget.css',
			array(),
			$this->version
		);
		
		// Widget JS
		wp_enqueue_script( 
			$this->plugin_name . '-widget-ce', 
			plugin_dir_url( __FILE__ ) . 'js/proleadsai-widget-ce.js', 
			array(), 
			$this->version, 
			true 
		);
	}

	/**
	 * Generate widget HTML
	 */
	private function get_widget_html( $display_mode = 'floating', $extra_options = array() ) {
		$settings = get_option( 'proleadsai_onboarding', array() );
		
		$button_position = $settings['button_position'] ?? 'bottom-right';
		$primary_color = $settings['primary_color'] ?? '#facc15';
		$text_color = $settings['text_color'] ?? '#1c1917';
		$button_text = $settings['button_text'] ?? 'Get Roof Estimate';
		$button_emoji = $settings['button_emoji'] ?? '🏠';
		$org_id = $settings['team_id'] ?? '';
		$google_maps_api_key = $settings['google_maps_api_key'] ?? '';
		
		// Extra attributes for inline/shortcode mode
		$extra_attrs = '';
		if ( ! empty( $extra_options['heading'] ) ) {
			$extra_attrs .= sprintf( ' heading="%s"', esc_attr( $extra_options['heading'] ) );
		}
		if ( ! empty( $extra_options['bg_style'] ) ) {
			$extra_attrs .= sprintf( ' bg-style="%s"', esc_attr( $extra_options['bg_style'] ) );
		}
		if ( ! empty( $extra_options['bg_color'] ) ) {
			$extra_attrs .= sprintf( ' bg-color="%s"', esc_attr( $extra_options['bg_color'] ) );
		}
		if ( isset( $extra_options['hero_image'] ) ) {
			$extra_attrs .= sprintf( ' hero-image="%s"', esc_attr( $extra_options['hero_image'] ) );
		}
		if ( ! empty( $extra_options['margin_top'] ) ) {
			$extra_attrs .= sprintf( ' margin-top="%s"', esc_attr( $extra_options['margin_top'] ) );
		}
		if ( ! empty( $extra_options['margin_bottom'] ) ) {
			$extra_attrs .= sprintf( ' margin-bottom="%s"', esc_attr( $extra_options['margin_bottom'] ) );
		}
		
		$api_url = function_exists('proleadsai_get_api_url') ? proleadsai_get_api_url() : 'https://next.proleadsai.com/api';
		
		return sprintf(
			'<roof-estimator
				org-id="%s"
				api-url="%s"
				google-maps-api-key="%s"
				primary-color="%s"
				text-color="%s"
				display-mode="%s"
				button-text="%s"
				button-emoji="%s"
				button-position="%s"%s
			></roof-estimator>',
			esc_attr( $org_id ),
			esc_attr( $api_url ),
			esc_attr( $google_maps_api_key ),
			esc_attr( $primary_color ),
			esc_attr( $text_color ),
			esc_attr( $display_mode ),
			esc_attr( $button_text ),
			esc_attr( $button_emoji ),
			esc_attr( $button_position ),
			$extra_attrs
		);
	}

}
