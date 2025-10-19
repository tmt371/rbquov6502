// File: 04-core-code/app-controller.js

import { EVENTS } from './config/constants.js';
import * as uiActions from './actions/ui-actions.js';

/**
 * @fileoverview Central application controller.
 * Manages the overall application flow and interactions between different components.
 */
export class AppController {
    constructor(appContext) {
        this.appContext = appContext;
        this.stateService = this.appContext.get('stateService');
        this.eventAggregator = this.appContext.get('eventAggregator');
        this.uiManager = this.appContext.get('uiManager');

        this._subscribeToEvents();
        console.log("AppController (Refactored with grouped subscriptions) Initialized.");
    }

    _subscribeToEvents() {
        const eventSubscriptions = {
            [EVENTS.STATE_CHANGED]: () => this.uiManager.render(this.stateService.getState()),
            [EVENTS.SAVE_STATE]: () => this.stateService.saveState(),
            [EVENTS.APP_READY]: () => {
                setTimeout(() => {
                    this.stateService.dispatch(uiActions.clearMultiSelectSelection());
                    this.eventAggregator.publish(EVENTS.FOCUS_CELL, { rowIndex: 0, column: 'width' });
                }, 100);
            },
            ...this._getViewEventSubscriptions(),
            ...this._getWorkflowEventSubscriptions()
        };

        for (const event in eventSubscriptions) {
            this.eventAggregator.subscribe(event, eventSubscriptions[event]);
        }
    }

    _getViewEventSubscriptions() {
        const quickQuoteView = this.appContext.get('quickQuoteView');
        const detailConfigView = this.appContext.get('detailConfigView');

        return {
            [EVENTS.NUMERIC_KEY_PRESSED]: (data) => quickQuoteView.handleNumericKeyPress(data),
            [EVENTS.INSERT_ROW_CLICKED]: () => quickQuoteView.handleInsertRow(),
            [EVENTS.DELETE_ROW_CLICKED]: () => quickQuoteView.handleDeleteRow(),
            [EVENTS.CLEAR_ROW_CLICKED]: () => quickQuoteView.handleClearRow(),
            [EVENTS.SAVE_TO_FILE_CLICKED]: () => quickQuoteView.handleSaveToFile(),
            [EVENTS.EXPORT_CSV_CLICKED]: () => quickQuoteView.handleExportCSV(),
            [EVENTS.RESET_CLICKED]: () => quickQuoteView.handleReset(),
            [EVENTS.MOVE_ACTIVE_CELL]: (data) => quickQuoteView.handleMoveActiveCell(data),
            [EVENTS.CALCULATE_SUM_CLICKED]: () => quickQuoteView.handleCalculateAndSum(),
            [EVENTS.TABLE_CELL_CLICKED]: (data) => quickQuoteView.handleTableCellClick(data),
            [EVENTS.SEQUENCE_CELL_CLICKED]: (data) => quickQuoteView.handleSequenceCellClick(data),
            [EVENTS.TYPE_CELL_CLICKED]: () => quickQuoteView.handleCycleType(),
            [EVENTS.MULTI_SELECT_MODE_TOGGLED]: () => quickQuoteView.handleToggleMultiSelectMode(),
            [EVENTS.SAVE_THEN_LOAD_CLICKED]: () => quickQuoteView.handleSaveThenLoad(),
            [EVENTS.TYPE_CELL_LONG_PRESS]: (data) => quickQuoteView.handleTypeCellLongPress(data),
            [EVENTS.TYPE_BUTTON_LONG_PRESS]: () => quickQuoteView.handleTypeButtonLongPress(),
            [EVENTS.USER_REQUESTED_MULTI_TYPE_SET]: () => quickQuoteView.handleMultiTypeSet(),
            [EVENTS.NAV_ITEM_CLICKED]: (data) => detailConfigView.handleNavigation(data),
            [EVENTS.K1_INPUT_KEYUP]: (data) => detailConfigView.handleK1Input(data),
            [EVENTS.K1_INPUT_BLUR]: (data) => detailConfigView.handleK1Blur(data),
            [EVENTS.K1_BATCH_APPLY_CLICKED]: () => detailConfigView.handleK1BatchApply(),
            [EVENTS.FABRIC_TYPE_SELECTED]: (data) => detailConfigView.handleFabricTypeSelection(data),
            [EVENTS.FABRIC_ROW_CLICKED]: (data) => detailConfigView.handleFabricRowClick(data),
            [EVENTS.CLEAR_LF_SELECTION_CLICKED]: () => detailConfigView.handleClearLfSelection(),
            [EVENTS.K2_BATCH_APPLY_CLICKED]: () => detailConfigView.handleK2BatchApply(),
            [EVENTS.K2_CLEAR_FABRIC_COLOR_CLICKED]: () => detailConfigView.handleK2ClearFabricAndColor(),
            [EVENTS.K3_CELL_CLICKED]: (data) => detailConfigView.handleK3CellClick(data),
            [EVENTS.K4_DRIVE_OPTION_CLICKED]: (data) => detailConfigView.handleDriveOptionClick(data),
            [EVENTS.K4_ACCESSORY_ADJUSTED]: (data) => detailConfigView.handleAccessoryAdjustment(data),
            [EVENTS.K5_DUAL_OPTION_CLICKED]: (data) => detailConfigView.handleDualOptionClick(data),
            [EVENTS.DUAL_CHAIN_KEY_PRESSED]: (data) => detailConfigView.handleDualChainKeyPress(data),
            [EVENTS.F1_INPUT_CHANGED]: (data) => detailConfigView.handleF1InputChange(data),
            [EVENTS.F2_INPUT_CHANGED]: (data) => detailConfigView.handleF2InputChange(data),
            [EVENTS.F2_CHECKBOX_CLICKED]: (data) => detailConfigView.handleF2CheckboxClick(data),
        };
    }

    _getWorkflowEventSubscriptions() {
        const workflowService = this.appContext.get('workflowService');
        return {
            [EVENTS.FOCUS_CELL]: (data) => workflowService.focusCell(data),
            [EVENTS.SHOW_NOTIFICATION]: (data) => workflowService.showNotification(data.message, data.type),
            [EVENTS.SHOW_CONFIRMATION_DIALOG]: (data) => workflowService.showDialog(data.message, data.layout, data.position),
            [EVENTS.TRIGGER_FILE_LOAD]: () => workflowService.triggerFileLoad(),
            [EVENTS.FILE_LOADED]: (data) => workflowService.handleFileLoaded(data),
            [EVENTS.HANDLE_K2_VALIDATION]: () => workflowService.handleK2ValidationAndTransition(),
        };
    }

    run() {
        this.eventAggregator.publish(EVENTS.APP_READY);
    }
}