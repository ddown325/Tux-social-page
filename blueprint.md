
# **Project Blueprint**

## **Overview**

A complete, ground-up redesign of Tux's personal landing page, inspired by a modern, vibrant, and professional aesthetic. The new site will feature a dynamic 3D background, a clean, sophisticated layout, and a vibrant color palette to create a top-tier user experience.

## **Design and Features**

### **Visual Design**

*   **Color Palette:** A cool and vibrant palette of deep purples and electric teals. Text is a stark black for maximum contrast and readability.
*   **Typography:** Use of the "Inter" font for its modern, clean, and highly legible characteristics. A strong typographic hierarchy will guide the user's eye.
*   **3D Hero Text:** The main title, "Tux's Socials", is rendered as a 3D object using Three.js, with a subtle, gentle animation to make it feel alive.
*   **Layout:** A two-part layout consisting of an upper "hero" section and a lower "socials" section. The hero section cleanly presents the user's identity, while the lower section provides a dedicated space for social media links against a solid background.
*   **3D Background:** A dynamic background scene created with **Three.js**. It features gently floating and rotating discs in purple and teal, with realistic physics-based interactions, including collision avoidance and bouncing off screen edges.

### **Interactive Features**

*   **Click-and-Drag Camera:** Users can click and drag to orbit the camera around the 3D scene, and use the scroll wheel to zoom in and out, thanks to Three.js `OrbitControls`.
*   **Social Links:** The social media links are designed as large, prominent, circular profile pictures. Each link features a beautiful image and text, providing a clear and stylish call to action in their own dedicated section.
*   **Hover Effects:** Subtle and elegant hover effects on the social links to provide clean visual feedback to the user.

### **Technical Implementation**

*   **Three.js:** Integration of the Three.js library via ES Modules to render the complex 3D background scene. The animation logic has been significantly upgraded to include collision avoidance and boundary bouncing.
*   **`FontLoader` and `TextGeometry`:** Used to create the 3D text for the main title.
*   **`OrbitControls`:** Implementation of camera controls for interactive scene exploration.
*   **Modern CSS:** A completely new stylesheet using Flexbox for a robust two-part layout, custom properties for theming, and performance-minded animations.
*   **Modern JavaScript (ESM):** The project uses modern ES Modules (`import`/`export`) for better code organization.

## **Current Plan**

I am implementing a new feature to make the main title ("Tux's Socials") a 3D object with a subtle animation, similar to the floating discs but anchored in place.
