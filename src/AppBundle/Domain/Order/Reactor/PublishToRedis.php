<?php

namespace AppBundle\Domain\Order\Reactor;

use AppBundle\Domain\Order\Event;
use Predis\Client as Redis;
use Symfony\Component\Serializer\SerializerInterface;

class PublishToRedis
{
    private $redis;
    private $serializer;

    public function __construct(Redis $redis, SerializerInterface $serializer)
    {
        $this->redis = $redis;
        $this->serializer = $serializer;
    }

    public function __invoke(Event $event)
    {
        // TODO Deprecate channel "restaurant:*:orders"
        // TODO How to manage non-foodtech orders?

        $this->redis->publish(
            $event::messageName(),
            json_encode($this->createRedisMessage($event))
        );
    }

    private function createRedisMessage(Event $event)
    {
        $order = $event->getOrder();

        return [
            'order' => $this->serializer->serialize($order, 'jsonld', ['groups' => ['order', 'place']]),
            'data' => $event->toPayload(),
            // FIXME We should retrieve the actual date from EventStore
            'createdAt' => (new \DateTime())->format(\DateTime::ATOM),
        ];
    }
}
