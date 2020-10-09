/**
 * WordPress dependencies
 */
import { compose, ifCondition } from '@wordpress/compose';
import { withSelect, withDispatch } from '@wordpress/data';

import * as others from 'gutenberg/packages/editor/build-module/components/autosave-monitor?source=node_modules';

const { AutosaveMonitor } = others;

export default compose([
  withSelect(select => {
    const {
      isEditedPostDirty,
      isEditedPostAutosaveable,
      getEditorSettings,
    } = select('core/editor');

    const { autosaveInterval, canSave, canAutosave } = getEditorSettings();

    return {
      isDirty: isEditedPostDirty(),
      isAutosaveable: isEditedPostAutosaveable(),
      autosaveInterval,
      // GUTENBERG JS
      canSave,
      canAutosave,
    };
  }),
  withDispatch(dispatch => ({
    autosave: dispatch('core/editor').autosave,
  })),
  // GUTENBERG JS
  // added the ifCondition to enable/disable
  // the autoave feature according 'canSave' and 'canAutosave' settings
  ifCondition(({ canSave, canAutosave }) => canSave && canAutosave),
])(AutosaveMonitor);

export * from 'gutenberg/packages/editor/build-module/components/autosave-monitor?source=node_modules';
