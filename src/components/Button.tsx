import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon } from './Icon';
import type { GlyphName } from './glyphs';
import styles from './Button.module.css';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'soft' | 'link';
  size?: 'large' | 'medium';
  icon?: GlyphName;
  iconAccent?: boolean;
  children: ReactNode;
};

export function Button({
  variant = 'primary',
  size = 'large',
  icon,
  iconAccent = false,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = [styles.button, styles[variant], styles[size], className]
    .filter(Boolean)
    .join(' ');
  return (
    <button type={type} className={classes} {...rest}>
      {icon && <Icon name={icon} size={size === 'large' ? 22 : 20} accent={iconAccent} />}
      {children}
    </button>
  );
}
