import { forwardRef } from 'react';
import { classNames } from '~/utils/classNames';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={classNames('rounded-lg border bg-card text-card-foreground shadow-sm p-2 sm:p-3 md:p-4', className)}
      {...props}
    />
  ),
);

Card.displayName = 'Card';

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={classNames('flex flex-col space-y-1.5 sm:space-y-2 p-2 sm:p-3 md:p-4', className)} {...props} />
  ),
);

CardHeader.displayName = 'CardHeader';

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={classNames('text-sm sm:text-lg font-semibold leading-none tracking-tight', className)} {...props} />
  ),
);

CardTitle.displayName = 'CardTitle';

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={classNames('text-xs sm:text-sm text-muted-foreground', className)} {...props} />
  ),
);

CardDescription.displayName = 'CardDescription';

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => <div ref={ref} className={classNames('p-2 sm:p-3 md:p-4 pt-0', className)} {...props} />,
);

CardContent.displayName = 'CardContent';

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={classNames('flex items-center p-2 sm:p-3 md:p-4 pt-0', className)} {...props} />
  ),
);

CardFooter.displayName = 'CardFooter';
