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
		// Get onboarding settings
		$settings = get_option( 'proleadsai_onboarding', array() );
		$completed = ! empty( $settings['completed'] );
		
		// Always enqueue styles for widget functionality
		wp_enqueue_style( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'css/proleadsai-widget.css', array(), $this->version, 'all' );
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
		
		// Enqueue scripts if onboarding is completed (needed for shortcode too)
		if ( $completed ) {
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
		
		$visual_options = $this->get_visual_attributes( $settings, array(), 'floating' );
		$widget_html = $this->get_widget_html( 'floating', $visual_options );
		
		// Custom KSES to allow roof-estimator element and its attributes
		$allowed_html = wp_kses_allowed_html( 'post' );
		$allowed_html['roof-estimator'] = array(
			'org-id' => true,
			'api-url' => true,
			'google-maps-api-key' => true,
			'primary-color' => true,
			'text-color' => true,
			'display-mode' => true,
			'button-text' => true,
			'button-emoji' => true,
			'button-position' => true,
			'heading' => true,
			'bg' => true,
			'image' => true,
			'heading-color' => true,
			'text-color-shortcode' => true,
			'heading-size' => true,
			'text-size' => true,
		);
		
		echo wp_kses( $widget_html, $allowed_html );
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
		
		$visual_options = $this->get_visual_attributes( $settings, (array) $atts, 'inline' );
		
		// Enqueue scripts/styles for shortcode usage
		$this->enqueue_shortcode_assets();
		
		$widget_html = $this->get_widget_html( 'inline', $visual_options );
		
		// Custom KSES to allow roof-estimator element and its attributes
		$allowed_html = wp_kses_allowed_html( 'post' );
		$allowed_html['roof-estimator'] = array(
			'org-id' => true,
			'api-url' => true,
			'google-maps-api-key' => true,
			'primary-color' => true,
			'text-color' => true,
			'display-mode' => true,
			'button-text' => true,
			'button-emoji' => true,
			'button-position' => true,
			'heading' => true,
			'bg' => true,
			'image' => true,
			'heading-color' => true,
			'text-color-shortcode' => true,
			'heading-size' => true,
			'text-size' => true,
		);
		
		return wp_kses( $widget_html, $allowed_html );
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
	 * Generic method to parse visual attributes from settings + overrides
	 */
	private function get_visual_attributes( $settings, $atts = array(), $display_mode = 'inline' ) {
		$is_floating = ( $display_mode === 'floating' );
		$default_heading = 'Free Roof Estimate Instantly';
		$settings_heading = $is_floating ? ( $settings['sidebar_heading'] ?? '' ) : ( $settings['shortcode_heading'] ?? '' );
		if ( $is_floating && empty( $settings_heading ) ) {
			$settings_heading = $settings['shortcode_heading'] ?? '';
		}
		if ( empty( $settings_heading ) ) {
			$settings_heading = $default_heading;
		}

		$settings_bg_style = $is_floating ? ( $settings['sidebar_bg_style'] ?? 'none' ) : ( $settings['shortcode_bg_style'] ?? 'none' );
		$settings_bg_color = $is_floating ? ( $settings['sidebar_bg_color'] ?? '#f5f5f4' ) : ( $settings['shortcode_bg_color'] ?? '#f5f5f4' );
		if ( $is_floating && ( ! isset( $settings['sidebar_bg_style'] ) || $settings_bg_style === '' ) ) {
			$settings_bg_style = $settings['shortcode_bg_style'] ?? 'none';
		}
		if ( $is_floating && ( ! isset( $settings['sidebar_bg_color'] ) || $settings_bg_color === '' ) ) {
			$settings_bg_color = $settings['shortcode_bg_color'] ?? '#f5f5f4';
		}

		$settings_image = $is_floating ? ( $settings['sidebar_image'] ?? 'default' ) : ( $settings['shortcode_image'] ?? 'default' );
		$settings_custom_image = $is_floating ? ( $settings['sidebar_custom_image'] ?? '' ) : ( $settings['shortcode_custom_image'] ?? '' );
		if ( $is_floating && ( ! isset( $settings['sidebar_image'] ) || $settings_image === '' ) ) {
			$settings_image = $settings['shortcode_image'] ?? 'default';
		}
		if ( $is_floating && ( ! isset( $settings['sidebar_custom_image'] ) || $settings_custom_image === '' ) ) {
			$settings_custom_image = $settings['shortcode_custom_image'] ?? '';
		}

		$settings_heading_font = $is_floating ? ( $settings['sidebar_heading_font'] ?? '' ) : ( $settings['heading_font'] ?? '' );
		$settings_heading_color = $is_floating ? ( $settings['sidebar_heading_color'] ?? '' ) : ( $settings['heading_color'] ?? '' );
		$settings_text_font = $is_floating ? ( $settings['sidebar_text_font'] ?? '' ) : ( $settings['text_font'] ?? '' );
		$settings_text_color = $is_floating ? ( $settings['sidebar_text_color'] ?? '' ) : ( $settings['text_color_shortcode'] ?? '' );
		$settings_heading_size = $is_floating ? ( $settings['sidebar_heading_size'] ?? '' ) : ( $settings['heading_size'] ?? '' );
		$settings_text_size = $is_floating ? ( $settings['sidebar_text_size'] ?? '' ) : ( $settings['text_size'] ?? '' );

		if ( $is_floating && empty( $settings_heading_font ) ) $settings_heading_font = $settings['heading_font'] ?? '';
		if ( $is_floating && empty( $settings_heading_color ) ) $settings_heading_color = $settings['heading_color'] ?? '';
		if ( $is_floating && empty( $settings_text_font ) ) $settings_text_font = $settings['text_font'] ?? '';
		if ( $is_floating && empty( $settings_text_color ) ) $settings_text_color = $settings['text_color_shortcode'] ?? '';
		if ( $is_floating && empty( $settings_heading_size ) ) $settings_heading_size = $settings['heading_size'] ?? '';
		if ( $is_floating && empty( $settings_text_size ) ) $settings_text_size = $settings['text_size'] ?? '';

		// Defaults
		$defaults = array(
			'heading' => $settings_heading,
			'bg' => $settings_bg_style,
			'image' => null, // null means use settings default
			'mt' => $settings['shortcode_margin_top'] ?? '',
			'mb' => $settings['shortcode_margin_bottom'] ?? '',
			'heading-font' => $settings_heading_font,
			'heading-color' => $settings_heading_color,
			'text-font' => $settings_text_font,
			// NOTE: use text-color-shortcode for widget body text color; keep text-color for backward compat
			'text-color-shortcode' => $settings_text_color,
			'text-color' => $settings_text_color,
			'heading-size' => $settings_heading_size,
			'text-size' => $settings_text_size,
		);

		// Merge with provided attributes
		$atts = shortcode_atts( $defaults, $atts, 'proleadsai_widget' );
		
		// file_put_contents( __DIR__ . '/debug_atts.log', print_r( $atts, true ), FILE_APPEND );

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
			$bg_color = $settings_bg_color;
		}
		
		// Determine hero image
		$hero_image = '';
		if ( $atts['image'] === null ) {
			// Use settings default
			$image_setting = $settings_image;
			$custom_image = $settings_custom_image;
			
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

		$text_color_attr = $atts['text-color-shortcode'];
		if ( empty( $text_color_attr ) ) {
			$text_color_attr = $atts['text-color'];
		}

		return array(
			'heading' => $atts['heading'],
			'bg_style' => $bg_style,
			'bg_color' => $bg_color,
			'hero_image' => $hero_image,
			'margin_top' => $atts['mt'],
			'margin_bottom' => $atts['mb'],
			'heading_font' => $atts['heading-font'],
			'heading_color' => $atts['heading-color'],
			'text_font' => $atts['text-font'],
			'text_color' => $text_color_attr,
			'heading_size' => $atts['heading-size'],
			'text_size' => $atts['text-size'],
		);
	}

	/**
	 * Returns fully escaped widget HTML.
	 *
	 * @return string Safe HTML output
	 */
	private function get_widget_html( $display_mode = 'floating', $extra_options = array() ) {
		$settings = get_option( 'proleadsai_onboarding', array() );
		
		// For floating mode, don't use inline-specific settings
		if ( $display_mode === 'floating' ) {
			$button_position = $settings['button_position'] ?? 'bottom-right';
			$primary_color = $settings['primary_color'] ?? '#facc15';
			$text_color = $settings['text_color'] ?? '#1c1917';
			$button_text = $settings['button_text'] ?? 'Get Roof Estimate';
			$button_emoji = $settings['button_emoji'] ?? '🏠';
			$org_id = $settings['team_id'] ?? '';
			$google_maps_api_key = $settings['google_maps_api_key'] ?? '';
			$extra_attrs = ''; // No extra attributes for floating mode
		} else {
			// Inline mode uses all settings including extra options
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
			// Typography
			if ( ! empty( $extra_options['heading_font'] ) ) {
				$extra_attrs .= sprintf( ' heading-font="%s"', esc_attr( $extra_options['heading_font'] ) );
			}
			if ( ! empty( $extra_options['heading_color'] ) ) {
				$extra_attrs .= sprintf( ' heading-color="%s"', esc_attr( $extra_options['heading_color'] ) );
			}
			if ( ! empty( $extra_options['text_font'] ) ) {
				$extra_attrs .= sprintf( ' text-font="%s"', esc_attr( $extra_options['text_font'] ) );
			}
			if ( ! empty( $extra_options['text_color'] ) ) {
				$extra_attrs .= sprintf( ' text-color-shortcode="%s"', esc_attr( $extra_options['text_color'] ) );
			}
			if ( ! empty( $extra_options['heading_size'] ) ) {
				$extra_attrs .= sprintf( ' heading-size="%s"', esc_attr( $extra_options['heading_size'] ) );
			}
			if ( ! empty( $extra_options['text_size'] ) ) {
				$extra_attrs .= sprintf( ' text-size="%s"', esc_attr( $extra_options['text_size'] ) );
			}
		}
		
		$api_url = function_exists('proleadsai_get_api_url') ? proleadsai_get_api_url() : 'https://app.proleadsai.com/api';
		
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
