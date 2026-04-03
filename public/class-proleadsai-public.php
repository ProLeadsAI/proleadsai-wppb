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
		// Don't load on admin pages
		if (is_admin()) {
			return;
		}
	}

	/**
	 * Register the JavaScript for the public-facing side of the site.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_scripts() {
		// Don't load on admin pages
		if (is_admin()) {
			return;
		}
		
		// Get onboarding settings
		$settings = get_option( 'proleadsai_onboarding', array() );
		$completed = ! empty( $settings['completed'] );
		
		if ( $completed ) {
			wp_enqueue_script(
				$this->plugin_name . '-widget-launcher',
				plugin_dir_url( __FILE__ ) . 'js/proleadsai-widget-launcher.js',
				array(),
				$this->version,
				true
			);

			wp_localize_script(
				$this->plugin_name . '-widget-launcher',
				'proleadsaiWidget',
				$this->get_floating_widget_config( $settings )
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
		
		echo $this->get_floating_button_html( $settings ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
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
		
		$widget_html = $this->get_iframe_html( 'inline', $visual_options );

		$allowed_html = wp_kses_allowed_html( 'post' );
		$allowed_html['iframe'] = array(
			'src' => true,
			'width' => true,
			'height' => true,
			'scrolling' => true,
			'style' => true,
			'class' => true,
			'loading' => true,
			'referrerpolicy' => true,
			'allow' => true,
			'title' => true,
		);
		
		return wp_kses( $widget_html, $allowed_html );
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

	private function get_widget_base_url() {
		return 'https://widgets.proleadsai.com';
	}

	private function get_iframe_src( $display_mode = 'inline', $extra_options = array() ) {
		$settings = get_option( 'proleadsai_onboarding', array() );
		$query_args = array(
			'org-id' => $settings['team_id'] ?? '',
			'display-mode' => $display_mode,
			'disable-when-unavailable' => 'true',
		);

		$default_primary_color = '#facc15';
		$default_text_color = '#1c1917';
		$default_button_text = 'Get Roof Estimate';
		$default_button_emoji = '🏠';
		$default_button_position = 'bottom-right';

		$primary_color = $settings['primary_color'] ?? $default_primary_color;
		$text_color = $settings['text_color'] ?? $default_text_color;
		$button_text = $settings['button_text'] ?? $default_button_text;
		$button_emoji = $settings['button_emoji'] ?? $default_button_emoji;
		$button_position = $settings['button_position'] ?? $default_button_position;

		if ( $primary_color !== $default_primary_color ) {
			$query_args['primary-color'] = $primary_color;
		}
		if ( $text_color !== $default_text_color ) {
			$query_args['text-color'] = $text_color;
		}
		if ( $button_text !== $default_button_text ) {
			$query_args['button-text'] = $button_text;
		}
		if ( $button_emoji !== $default_button_emoji ) {
			$query_args['button-emoji'] = $button_emoji;
		}
		if ( $button_position !== $default_button_position ) {
			$query_args['button-position'] = $button_position;
		}

		$map = array(
			'heading' => 'heading',
			'bg_style' => 'bg-style',
			'bg_color' => 'bg-color',
			'hero_image' => 'hero-image',
			'margin_top' => 'margin-top',
			'margin_bottom' => 'margin-bottom',
			'heading_font' => 'heading-font',
			'heading_color' => 'heading-color',
			'text_font' => 'text-font',
			'text_color' => 'text-color-shortcode',
			'heading_size' => 'heading-size',
			'text_size' => 'text-size',
		);

		foreach ( $map as $key => $query_key ) {
			if ( isset( $extra_options[ $key ] ) && $extra_options[ $key ] !== '' ) {
				$query_args[ $query_key ] = $extra_options[ $key ];
			}
		}

		return $this->get_widget_base_url() . '/iframe?' . http_build_query( $query_args );
	}

	private function get_iframe_html( $display_mode = 'inline', $extra_options = array() ) {
		$src = $this->get_iframe_src( $display_mode, $extra_options );
		return sprintf(
			'<div class="proleadsai-widget-embed" style="width:100%%;max-width:100%%;display:block;clear:both;"><iframe class="proleadsai-widget-inline-frame" src="%s" title="%s" width="100%%" height="0" scrolling="no" style="display:block;width:100%%;min-width:100%%;max-width:100%%;height:0;border:0;overflow:hidden;background:transparent;" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="clipboard-write"></iframe></div>',
			esc_url( $src ),
			esc_attr__( 'ProLeadsAI Roof Estimator', 'proleadsai' )
		);
	}

	private function get_floating_widget_config( $settings ) {
		$visual_options = $this->get_visual_attributes( $settings, array(), 'floating' );
		$widget_status_url = '';
		if ( function_exists( 'proleadsai_get_api_url' ) && ! empty( $settings['team_id'] ) ) {
			$widget_status_url = trailingslashit( proleadsai_get_api_url() ) . 'organization/' . rawurlencode( $settings['team_id'] ) . '/widget-status';
		}
		return array(
			'iframeUrl' => $this->get_iframe_src( 'inline', $visual_options ),
			'panelTitle' => 'ProLeadsAI Roof Estimator',
			'widgetStatusUrl' => $widget_status_url,
		);
	}

	private function get_floating_button_html( $settings ) {
		$primary_color = esc_attr( $settings['primary_color'] ?? '#facc15' );
		$text_color = esc_attr( $settings['text_color'] ?? '#1c1917' );
		$button_text = esc_html( $settings['button_text'] ?? 'Get Roof Estimate' );
		$button_emoji = esc_html( $settings['button_emoji'] ?? '🏠' );
		$button_position = $settings['button_position'] ?? 'bottom-right';

		$position_styles = array(
			'bottom-right' => 'bottom:2rem;right:2rem;',
			'bottom-left' => 'bottom:2rem;left:2rem;',
			'bottom-center' => 'bottom:2rem;left:50%;transform:translateX(-50%);',
			'left-edge' => 'left:0;top:50%;transform:translateY(-50%);border-radius:0 .5rem .5rem 0;writing-mode:vertical-lr;text-orientation:sideways;',
			'right-edge' => 'right:0;top:50%;transform:translateY(-50%);border-radius:.5rem 0 0 .5rem;writing-mode:vertical-rl;text-orientation:mixed;',
		);

		$position_style = $position_styles[ $button_position ] ?? $position_styles['bottom-right'];
		$base_style = 'position:fixed;z-index:99997;display:flex;align-items:center;gap:.5rem;padding:.75rem 1.25rem;font-size:.875rem;font-weight:600;box-shadow:0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -4px rgba(0,0,0,.1);cursor:pointer;border:0;border-radius:9999px;';
		$style = $base_style . 'background:' . $primary_color . ';color:' . $text_color . ';' . $position_style;

		return sprintf(
			'<button id="proleadsai-widget-button" type="button" style="%s;display:none;"><span>%s</span><span>%s</span></button>',
			esc_attr( $style ),
			$button_emoji,
			$button_text
		);
	}

}
