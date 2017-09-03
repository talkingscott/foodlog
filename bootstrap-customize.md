# Bootstrap Customization

The pre-compiled bootstrap and bootstrap-theme on bootstrapcdn produce a very bland and sometimes annoying app.

The blandness is at least somewhat attributable to the large amount of white on the screen.  A different background color is essential.  Adding a gradient makes the app more visually interesting.  However, the gradient must be horizontal.  When it is vertical, there are discontinuities.

The annoyance is the interaction of the chosen font size (14pt) with the iOS default/canonical size (16pt).  When an input with a 14pt font size is selected by the user, iOS zooms the display, presumably to enlarge the font to 16pt.  The zoom is jarring, the resulting app visualization extends off screen, and there is no corresponding automatic reverse zooming when the input loses focus.

So, the starting point for customization is a different background color (@body-bg) and base font size (@font-size-base).  There is no gradient customization, so that must be done in CSS in the app itself.  I picked the gold from www.steelers.com (#ffb612) as the background color and 16pt for the base font size.  I left @gray-base at #000.  Nothing is that dark on www.steelers.com, but bootstrap mainly uses lightened versions of that base, anyway.  The various brand colors probably need to be adjusted.  Other #fff colors include @component-active-color, @btn-xxx-color, @btn-default-bg, @input-bg, @dropdown-bg, @navbar-inverse-link-hover-color, @navbar-inverse-brand-hover-color, @navbar-inverse-toggle-icon-bar-bg, @pagination-bg, @pagination-active-color, @pagination-disabled-bg, @tooltip-color, @popover-bg, @label-color, @label-link-hover-color, @model-content-bg, @progress-bar-color, @list-group-bg, @panel-bg, @panel-primary-text, @badge-color, @badge-link-hover-color, @badge-active-bg, @carousel-control-color, @carousel-indicator-border-color, @carousel-caption-color, @carousel-indicator-active-bg, @kbd-color.  Yikes.

Success! Your configuration has been saved to https://gist.github.com/f36466b00727a2bcd13d8a092367d314 and can be revisited here at https://getbootstrap.com/docs/3.3/customize/?id=f36466b00727a2bcd13d8a092367d314 for further customization.

```bash
cd public
unzip ~/Downloads/bootstrap.zip
```

OK, button, alert and link colors are anywhere from minimally acceptable to total crap.  I grabbed the blue (#00539B) and red (#C60C30) from the Steelers logo and black (#252525) from a navigation bar on www.steelers.com.  Those need to map to @brand-primary, @brand-danger and @brand-info.

OK, that wasn't totally correct.  The @brand-xxx cascade to the button colors as desired.  The alert colors come from @state-xxx settings.  Make @state-info-bg #252525, @state-info-text #a0a0a0 and @state-danger-bg #C60C30 and @state-danger-text #F71D78.
