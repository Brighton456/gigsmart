import React, { useMemo } from 'react';
import Joyride, { STATUS } from 'react-joyride';

const InteractiveOnboardingTour = ({
  run = false,
  steps = [],
  continuous = true,
  showSkipButton = true,
  showProgress = true,
  locale,
  styles,
  onFinish,
  disableOverlayClose = true,
  scrollToFirstStep = true,
  stepIndex,
  callback,
  ...rest
}) => {
  // Enable on web with react-joyride
  
  const joyrideSteps = useMemo(() => steps.filter(Boolean), [steps]);

  const handleJoyrideCallback = (data) => {
    const { status, lifecycle } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      onFinish?.(status);
    }

    if (lifecycle === 'close') {
      onFinish?.(status || 'closed');
    }
  };

  if (!Array.isArray(joyrideSteps) || joyrideSteps.length === 0) {
    return null;
  }

  return (
    <Joyride
      run={run}
      steps={joyrideSteps}
      continuous={continuous}
      showSkipButton={showSkipButton}
      showProgress={showProgress}
      scrollToFirstStep={scrollToFirstStep}
      disableOverlayClose={disableOverlayClose}
      callback={callback || handleJoyrideCallback}
      locale={locale}
      styles={styles}
      stepIndex={typeof stepIndex === 'number' ? stepIndex : undefined}
      {...rest}
    />
  );
};

export default InteractiveOnboardingTour;
