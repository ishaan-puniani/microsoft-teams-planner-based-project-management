import { i18n } from 'src/i18n';
import Spinner from 'src/view/shared/Spinner';
import ViewWrapper from 'src/view/shared/styles/ViewWrapper';
import TextViewItem from 'src/view/shared/view/TextViewItem';

const ScheduledEventView = (props) => {
  const { record, loading } = props;

  if (loading || !record) {
    return <Spinner />;
  }

  return (
    <ViewWrapper>
      <TextViewItem
        label={i18n('entities.scheduledEvent.fields.title')}
        value={record.title}
      />

      <TextViewItem
        label={i18n('entities.scheduledEvent.fields.description')}
        value={record.description}
      />

      <TextViewItem
        label={i18n('entities.scheduledEvent.fields.startDate')}
        value={record.startDate ? new Date(record.startDate).toLocaleString() : ''}
      />

      <TextViewItem
        label={i18n('entities.scheduledEvent.fields.endDate')}
        value={record.endDate ? new Date(record.endDate).toLocaleString() : ''}
      />

      <TextViewItem
        label={i18n('entities.scheduledEvent.fields.allDay')}
        value={record.allDay ? i18n('common.yes') : i18n('common.no')}
      />

      <TextViewItem
        label={i18n('entities.scheduledEvent.fields.location')}
        value={record.location}
      />

      <TextViewItem
        label={i18n('entities.scheduledEvent.fields.timezone')}
        value={record.timezone}
      />

      {record.rruleString && (
        <TextViewItem
          label={i18n('entities.scheduledEvent.fields.rruleString')}
          value={record.rruleString}
        />
      )}
    </ViewWrapper>
  );
};

export default ScheduledEventView;
