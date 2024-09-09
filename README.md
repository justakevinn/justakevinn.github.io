# synthordle


To put in new reactions:

Create a new folder, and name it the next available integer in the "Reactions" folder.

Use Chemdraw to draw out the starting material, product, and each of the intermediates and individually save them as png files
    Names of files should be sm.png, product.png, int0.png, int1.png, and int2.png

Draw out the conditions and fit them into the reagents box (adjust your font size and do NOT resize the box!)
Save the reagents in the "Reagents" folder and name them with the following syntax: rxnx_y; where x is the reaction number and y is the index of the reagents


Things that need to be worked on:
Adding more problems!

Overall aesthetic. To be honest, it's kind of ugly right now. Most of it can be fixed by just playing with the .css file and fixing spacing, formatting, etc. but will just take some time. One notable one is that some images might also be stretched if the chemdraw png file exceeds the size of the box (cotylenol SM, for example).

While the intermediate boxes flip fine, the reagent boxes currently spin 360°C (a bit too much) as opposed to 180°. I couldn't figure out a way to retain the image while also having the flipping animation.
---I think this is okay...---



Allowing users to switch between "forward synthesis" and "retrosynthesis" might be helpful. 
---Done---

Adding labels (TGT/SM) and arrows so that it is more clear which direction the synthesis is.
---Done---

Some minor ways a user can cheat and deduce the answer without playing the game
    1) Refreshing the page multiple times to see which answers in the keyboard always appear - those will be the ones required for the synthesis
    2) Hovering above the boxes and interpreting the meaning of "rxn0_1"

Creating a menu to make user input more aesthetically pleasing
---Jonah is working on this---

Need a good way to reveal the answer when the game is over.
---Kevin is working on this---






