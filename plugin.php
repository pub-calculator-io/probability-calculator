<?php
/*
Plugin Name: Probability Calculator by www.calculator.io
Plugin URI: https://www.calculator.io/probability-calculator/
Description: The probability calculator can find two events' probability and the normal distribution probability. Learn more about probability's laws and calculations.
Version: 1.0.0
Author: Calculator.io
Author URI: https://www.calculator.io/
License: GPLv2 or later
Text Domain: ci_probability_calculator
*/

if (!defined('ABSPATH')) exit;

if (!function_exists('add_shortcode')) return "No direct call for Probability Calculator by Calculator.iO";

function display_ci_probability_calculator(){
    $page = 'index.html';
    return '<h2><img src="' . esc_url(plugins_url('assets/images/icon-48.png', __FILE__ )) . '" width="48" height="48">Probability Calculator</h2><div><iframe style="background:transparent; overflow: scroll" src="' . esc_url(plugins_url($page, __FILE__ )) . '" width="100%" frameBorder="0" allowtransparency="true" onload="this.style.height = this.contentWindow.document.documentElement.scrollHeight + \'px\';" id="ci_probability_calculator_iframe"></iframe></div>';
}

add_shortcode( 'ci_probability_calculator', 'display_ci_probability_calculator' );